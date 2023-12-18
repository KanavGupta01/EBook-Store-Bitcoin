<script>
    import { onMount } from "svelte";
    import Book from "../lib/Book.svelte";

    let books = [];

    let fetchBooks = async () => {
        books = await fetch("http://localhost:5000").then((res) => res.json());
    };

    onMount(fetchBooks);
</script>


<div class="bookList">
    {#each books as book}
        <Book data={book} />
    {/each}
</div>

<style>
    .bookList {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }
</style>
