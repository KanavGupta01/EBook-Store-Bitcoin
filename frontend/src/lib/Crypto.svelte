<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import QrCode from "svelte-qrcode";
    import bip21 from "bip21";
    import io from "socket.io-client";
    import Swal from 'sweetalert2'

    export let isbn = "";
    let order = {
        status: "waiting",
        confirmations: 0,
    };

    async function createOrder() {
        let res = await fetch("http://localhost:5000/order/" + isbn, {
            method: "POST",
        }).then((res) => res.json());
        order.amount = res.amount;
        order.address = res.address;
        order.id = res.id
        console.log(order);
        order.url = bip21.encode(order.address, {
            amount: order.amount,
        });
        let socket = io("http://localhost:3030", { query: { id: order.id }, transports: ['polling'] });
        socket.on("update", (data) => {
            console.log(data);
            if (order.status == 'waiting' && data.status == 'received') {
                Swal.fire('Thank You!', 'Payment Received! E-Book will be delivered after 6 On-Chain Conformations.', 'success')
            }
            order.status = data.status;
            order.confirmations = data.confirmations;
        });
    }

    onMount(createOrder);
</script>

<div class="crypto">
    {#if order.url != undefined}
        <h3>Pay {order.amount} BTC</h3>
        <h3>To Address {order.address}</h3>
        <QrCode value={order?.url ?? "https://bitcoin.org"} />
        <h3>Status: {order.status}</h3>
        <h3>Confirmations: {order.confirmations} / 6</h3>
        {#if order.status == "received"}
            <h3 class="ok">Payment Received! E-Book will be delivered after 6 On-Chain Conformations.</h3>
        {/if}
    {:else}
        <h1 class="loading">Loading...</h1>
    {/if}
</div>

<style>
    .ok {
        max-width: 70%;
    }

    h3 {
        color: #f0f0f0;
        background-color: #f1897d;
        padding: 10px;
        border-radius: 10px 10px 10px 10px;
        text-align: center;
    }
    .crypto {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-grow: 100;
    }
    .loading {
        margin: auto;
    }
</style>
