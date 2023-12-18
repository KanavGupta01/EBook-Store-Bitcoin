const app = require('express')()
const cors = require('cors')
const books = require('./books/books.json')
const request = require('request-promise-cache')
const bitcoin = require('bitcoinjs-lib')
const bitcoin_rpc = require('bitcoin')
const { Server } = require('socket.io')
const socket = new Server({
    cors: {
        origin: '*'
    }
})
const root = bitcoin.bip32.fromBase58('<PRIVATE_KEY>', bitcoin.networks.testnet)
const btcnode = new bitcoin_rpc.Client({
    host: 'localhost',
    port: '18333',
    user: 'satoshi',
    pass: 'satoshi'
})

app.use(cors())

// Serve Books Data
app.get('/', async (req, res) => {
    res.json(books)
})

// Serve Book Detail
app.get('/:uid', async (req, res) => {
    res.json(books.find((x) => x.isbn == req.params.uid) ?? { error: true })
})

// Create Book Order
app.post('/order/:uid', async (req, res) => {
    let book = books.find((x) => x.isbn == req.params.uid)
    if (!book) return res.json({ error: true })

    let id = (await fetch('http://localhost:3000/orders', { method: 'POST', body: JSON.stringify({ isbn: book.isbn }) }).then(res => res.json())).id

    let btc = await getAmountForPrice(book.price)

    let addy = await getNewAddress(id)

    console.log('New Order Created (id, btc, addy)', id, btc, addy)

    await fetch('http://localhost:3000/orders/' + id, {
        method: 'PATCH', headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify({ isbn: book.isbn, address: addy, amount: btc })
    })

    btcnode.cmd('importaddress', addy, null, false, function (err, result) {
        if (err) console.log('btccore error importaddress', err)
    })

    return res.json({
        amount: btc,
        address: addy,
        id: id
    })

})

// Received Transaction
app.post('/tx', require('express').json(), async (req, res) => {
    btcnode.cmd('gettransaction', req.body.transactionId, async function (err, result) {
        if (err) console.log('btccore error gettransaction', err)

        let orders = await fetch('http://localhost:3000/orders/').then(res => res.json())
        let order = orders.find(order => order.address == result.details[0].address)
        if (!order) return res.end()

        if (order.amount >= result.details[0].amount) {
            console.log('received tx', req.body.transactionId)
            console.log('tx stats (order amt, received amt, conformations)', order.amount, result.details[0].amount, result.confirmations)
            socket.to(`${order.id}`).emit('bruh')
            socket.to(`${order.id}`).emit('update', { 'status': 'received', 'confirmations': result.confirmations })
            await fetch('http://localhost:3000/orders/' + order.id, {
                method: 'PATCH', headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({ tx: req.body.transactionId })
            })
        }
        res.end()
    })
})

app.post('/block', async (req, res) => {
    let orders = await fetch('http://localhost:3000/orders/').then(res => res.json())
    orders = orders.filter(order => order.tx)

    orders.map(async order => {
        btcnode.cmd('gettransaction', order.tx, async function (err, result) {
            if (err) console.log('btccore gettransaction blockupdate error', err)

            if (!order) return
            if (order.amount >= result.details[0].amount) {
                console.log('received block update', order.tx)
                console.log('tx stats (order amt, received amt, conformations)', order.amount, result.details[0].amount, result.confirmations)
                socket.to(`${order.id}`).emit('bruh block')
                socket.to(`${order.id}`).emit('update', { 'status': 'received', 'confirmations': result.confirmations })
            }
        })
    })
    res.end()
})

socket.on('connection', async (socketConn) => {
    const id = socketConn.handshake.query.id
    console.log(id)
    socketConn.join(id)
    socketConn.emit('update', { 'status': 'waiting', 'confirmations': 0 })
})

async function getNewAddress(id) {
    const count = id
    const node = root.derive(count)
    return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network: bitcoin.networks.testnet }).address
}

async function getAmountForPrice(price) {
    const url = 'https://api.coindesk.com/v1/bpi/currentprice.json'
    const result = await request({
        url: url,
        cacheKey: url,
        cacheTTL: 15,
        cacheLimit: 24,
        resolveWithFullResponse: false
    })
    const response = JSON.parse(result)
    const rate = response["bpi"]["USD"]["rate_float"]
    return parseFloat(((price * 1e8) / (rate * 1e8)).toFixed(8))
}

app.listen(5000)
socket.listen(3030)