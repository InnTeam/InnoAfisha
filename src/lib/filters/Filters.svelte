<script>
  import { events } from "./imgData.js";
  import { types } from "./imgData.js";

  import ButtonContainer from "./ButtonContainer.svelte";
  import Gallery from "./Gallery.svelte";

  let selected = "all";

  const filterSelection = (e) => (selected = e.target.dataset.name);

  import { onMount } from "svelte";
  import { apiData, events_names } from "./store.js";

  onMount(async () => {
    fetch("http://127.0.0.1:8000/api/v1/events")
      .then((response) => response.json())
      .then((data) => {
        console.log(data[0]);
        apiData.set(data[0]);
      })
      .catch((error) => {
        console.log(error);
        return [];
      });
  });
</script>

<main>
  <ButtonContainer>
    {#each types as type}
      <button
        class:active={selected === type}
        class="btn"
        data-name={type}
        on:click={filterSelection}
      >
        {type}
      </button>
    {/each}
  </ButtonContainer>
  <Gallery>
    {#each events as { event_name, description, type, price, picture, date, time, rating, location, contacts, link}}
      {#if selected === "all"}
        <div class="show column">
          <div class="content">
            <img src={picture} alt={event_name} style="width:100%" />
            <h4>{event_name}</h4>
            <p>{description}</p>
          </div>
        </div>
      {:else}
        <div class:show={selected === type} class="column">
          <div class="content">
            <img src={picture} alt={event_name} style="width:100%" />
            <h4>{event_name}</h4>
            <p>{description}</p>
          </div>
        </div>
      {/if}
    {/each}
  </Gallery>
</main>

<style>
  /* Center website */
  main {
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* 	background-color: red; */
  }

  /* h1 {
    font-size: 2.8rem;
    font-weight: 100;
    margin: 0 0 10px;
  } */

  h4 {
    font-size: 2rem;
    margin: 0;
  }

  p {
    margin: 0 0 0.5rem;
    position: relative;
  }

  /* Create three equal columns */
  .column {
    width: 33.33%;
    display: none;
    justify-content: center;
    margin: 10px 0;
  }

  /* Content */
  .content {
    background-color: white;
    margin: 5px;
    padding: 10px;
    width: 30vw;
    box-shadow: 1px 1px 5px black;
  }

  img {
    min-height: 200px;
  }

  /* The "show" class is added to the filtered elements */
  .show {
    display: flex;
  }

  /* Style the buttons */
  .btn {
    width: 150px;
    text-transform: uppercase;
    font-weight: 200;
    font-size: 1.2rem;
    letter-spacing: 1px;
    border: none;
    outline: none;
    margin: 5px;
    padding: 14px 16px 12px;
    background-color: white;
    border: 1px solid black;
    cursor: pointer;
    transition: 0.1s ease-in-out;
  }

  /* Add a dark background color to the active button */
  .btn:active,
  .active {
    background-color: #000;
    color: white;
  }
</style>
