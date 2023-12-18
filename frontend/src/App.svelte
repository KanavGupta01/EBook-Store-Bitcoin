<script>
    import { Router, Route } from 'svelte-navigator'
    import Home from './pages/Home.svelte';
    import NotFound from './pages/NotFound.svelte';
    import Buy from './pages/Buy.svelte';
    import Nav from './lib/Nav.svelte';
</script>

<Router >
    <Nav />
    <Route path='/'>
        <Home />
    </Route>
    <Route path='/buy/:isbn' let:params>
        <Buy isbn={params.isbn}/>
    </Route>
    <Route path='*'>
        <NotFound />
    </Route>
</Router>