<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import Crypto from "../lib/Crypto.svelte";

    export let isbn = "";
    let book = {};

    let fetchBook = async () => {
        book = await fetch("http://localhost:5000/" + isbn).then((res) =>
            res.json()
        );
    };

    onMount(fetchBook);
</script>

{#if book.error}
    <h1>Book Not Found</h1>
{:else}
    <div class="outer-container">
        <div class="bookInfo">
            <img
                src={book.thumbnailUrl ??
                    "https://blog.foster.uw.edu/wp-content/uploads/2017/06/Generic-Book-Image-300x185.jpg"}
                alt="book thumbnail"
                on:error={(e) => {
                    e.target.src =
                        "https://blog.foster.uw.edu/wp-content/uploads/2017/06/Generic-Book-Image-300x185.jpg";
                }}
            />
            <div class="bookDesc">
                <h1>{book.title}</h1>
                <p>
                    {book.longDescription ??
                        "When it comes to mobile apps, Android can do almost anything   and with this book, so can you! Android runs on mobile devices ranging from smart phones to tablets to countless special-purpose gadgets. It's the broadest mobile platform available.    Android in Action, Second Edition is a comprehensive tutorial for Android developers. Taking you far beyond \"Hello Android,\" this fast-paced book puts you in the driver's seat as you learn important architectural concepts and implementation strategies. You'll master the SDK, build WebKit apps using HTML 5, and even learn to extend or replace Android's built-in features by building useful and intriguing examples. "}
                </p>
            </div>
        </div>

        <Crypto {isbn} />
    </div>
{/if}

<style>
    .outer-container {
        display: flex;
    }

    .bookInfo {
        display: flex;
        width: 70vw;
        margin-left: 50px;
        height: 50vh;
        height: fit-content;
    }

    .bookInfo img {
        min-width: 400px;
    }

    .bookDesc {
        margin-left: 20px;
    }

    .bookDesc p {
        font-size: 2.5vh;
        max-width: 50vw;
    }
</style>
