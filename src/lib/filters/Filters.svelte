<script>
  // import { events } from "./imgData.js";
  // import { types } from "./imgData.js";

  import ButtonContainer from "./ButtonContainer.svelte";
  import Gallery from "./Gallery.svelte";
  const types = ["all", "IT", "music", "culture", "cinema", "sport", "other"];

  let selected = "all";

  const filterSelection = (e) => (selected = e.target.dataset.name);

  import Spinner from "./spinner.svelte";

  let events = [];
  let colNames = [];
  let sourceJson = "events";

  async function getThings() {
    const res = await fetch(
      `http://innoafisha.pythonanywhere.com/api/v1/` + sourceJson
    );
    const json = await res.json();

    if (res.ok) {
      setTimeout(() => {
        events = json;
        //grab column names
        colNames = Object.keys(events[0]);

        return true;
      }, 0 * Math.random());
    } else {
      throw new Error(text);
    }
  }

  let promise = getThings();
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

  {#await promise}
    <Spinner />
  {:then getThings}
    <Gallery>
      {#each events as event, index (event.id)}
        {#if selected === "all"}
          <div class="show column">
            <a class="pickpick" href="#/event/{event.id}">
              <div class="content">
                <img
                  src={event["picture"]}
                  alt={event["event_name"]}
                  style="width:100%"
                />
                <h4>{event["event_name"]}</h4>
                <h5>{event["date"]}, {event["time"]}</h5>
                <p>{event["location"]}</p>
              </div>
            </a>
          </div>
        {:else}
          <div class:show={selected === event["type"]} class="column">
            <a class="pickpick" href="#/event/{event.id}">
              <div class="content">
                <img
                  src={event["picture"]}
                  alt={event["event_name"]}
                  style="width:100%"
                />
                <h4>{event["event_name"]}</h4>
                <p>{event["date"]}, {event["time"]}</p>
                <p>{event["location"]}</p>
              </div>
            </a>
          </div>
        {/if}
      {/each}
    </Gallery>
  {/await}
</main>

<style>
  main {
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .pickpick {
    position: relative;
    bottom: 0px;
    text-decoration: none;
    color: #1f3e24;
    
  }

  .pickpick:hover{
   opacity: 0.8; 
  }

  h4 {
    font-size: 2rem;
    margin: 0;
  }
  h5 {
    font-size: 1.2rem;
    margin: 0;
  }

  p {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
    position: relative;
  }

  .column {
    width: 33.33%;
    display: none;
    justify-content: center;
    margin: 10px 0;
  }

  .content {
    background-color: white;
    margin: 5px;
    padding: 10px;
    width: 30vw;
    box-shadow: 1px 1px 5px #1f3e24;
    border-radius: 10px;
    position: relative;
    min-height: 620px;
  }

  img {
    height: 350px;
    border-radius: 10px;
  }

  .show {
    display: flex;
  }

  .btn {
    font-family: "M PLUS 2", sans-serif;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: 0;
    border-radius: 5px;
    background: #7aae72;
    font-size: 18px;
    padding: 4px 8px;
    color: #1f3e24;
    min-width: 150px;
    cursor: pointer;
    margin: 30px 10px;
    margin-bottom: 0;
    transition: 0.1s ease-in-out;
    text-transform: uppercase;
  }

  .btn:hover {
    background: rgb(59, 102, 59);
    cursor: pointer;
  }

  .btn:active,
  .active {
    background-color: rgb(59, 102, 59);
    color: white;
  }
</style>
