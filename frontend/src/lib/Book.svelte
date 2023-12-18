<script>
// @ts-nocheck

    import { Link } from 'svelte-navigator'
    export let data = {
        title: "Sample Book",
        isbn: "Sample ISBN",
        author: "Sampe Author",
    };
</script>

<div class="card">
    <img
        src={data.thumbnailUrl ?? 'https://blog.foster.uw.edu/wp-content/uploads/2017/06/Generic-Book-Image-300x185.jpg'}
        alt="book thumbnail"
        on:error={(e) => {
            e.target.src='https://blog.foster.uw.edu/wp-content/uploads/2017/06/Generic-Book-Image-300x185.jpg'
        }}
    />
    <h2>{data.title}</h2>
    <p>By {data.authors[0]}</p>
    <p>ISBN: {data.isbn}</p>
    <button on:click={() => {}}><Link to='/buy/{data.isbn}'>Buy Now (USD {data.price})</Link></button>
</div>

<style>
    button:hover {
      background-color:#ec3925;
      transition: 0.7s;
      cursor: pointer;
  }

    button {
        margin-top: 20%;
        border: none;
        background-color: #f1897d;
        width: 15vw;
        height: 5vh;
        font-size: large;
    }
    .card {
        transition: box-shadow .3s;
        width: 20vw;
        height: 70vh;
        text-align: center;
        align-items: center;
        margin: 10px;
        border: 2px solid #ccc;
    }
    .card:hover {
        box-shadow: 0 0 5px 3px rgba(33,33,33,.2); 
    }
    img {
        object-fit: cover;
        width: 100%;
        height: 50%;
        object-position: center top;
    }
</style>
