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
            <div class="content">
              <img
                src={event["picture"]}
                alt={event["event_name"]}
                style="width:100%"
              />
              <h4>{event["event_name"]}</h4>
              <h5>{event["date"]}, {event["time"]}</h5>
              <p>{event["location"]}</p>
              <a class="pickpick" href="#/event/{event.id}"
                ><button type="button" name="run_script">Read More...</button
                ></a
              >
            </div>
          </div>
        {:else}
          <div class:show={selected === event["type"]} class="column">
            <div class="content">
              <img
                src={event["picture"]}
                alt={event["event_name"]}
                style="width:100%"
              />
              <h4>{event["event_name"]}</h4>
              <p>{event["date"]}, {event["time"]}</p>
              <p>{event["location"]}</p>
              <a class="pickpick" href="#/event/{event.id}"
                ><button type="button" name="run_script">Read More...</button
                ></a
              >
            </div>
          </div>
        {/if}
      {/each}
    </Gallery>
  {/await}
</main>

<style>
  /* Center website */
  main {
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  button[name="run_script"] {
    border: none;
    border-radius: 7px;
    padding: 10px 25px;
    background: #7aae72;
    cursor: pointer;
    text-transform: uppercase;
    font-weight: bold;
    color: white;
  }

  button[name="run_script"]:hover {
    background: #1f3e24;
  }

  .pickpick {
    position: relative;
    bottom: 0px;
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
