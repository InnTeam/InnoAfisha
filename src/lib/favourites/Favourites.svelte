<script>
  import Gallery from "./Gallery.svelte";
  import Spinner from "./spinner.svelte";
  import axios from "axios";

  let eventsIds = [];
  let events = [];

  async function getThings() {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Token ${document.cookie.replace(
      /(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    )}`;
    let res = await axios.get(
      "https://innoafisha.pythonanywhere.com/api/v1/favourites"
    );
    eventsIds = res.data;
    res = await axios.get(`http://innoafisha.pythonanywhere.com/api/v1/events`);
    events = res.data;
    
  }
  let promise = getThings();
</script>

<main>
  <h1>My favourites</h1>
  {#await promise}
    <Spinner />
  {:then getThings}
    <Gallery>
      {#each eventsIds as eventId, index (eventId.id)}
      {#each events as event, index (event.id)}
      {#if event.id === eventId["event"]}
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
          {/if}
      {/each}
      {/each}
      <!-- {#each eventsIds as eventId, index (eventId.id)} -->
      <!-- {#if events[eventId["event"]]} -->
      <!-- {events[eventId["event"]]['event_name']} -->
        <!-- <div class="show column">
          <div class="content">
            <img
              src={events[eventId["event"]]["picture"]}
              alt="event"
              style="width:100%"
            />
            <h4>{events[eventId["event"]]["event_name"]}</h4>
            <h5>
              {events[eventId["event"]]["date"]}, {events[eventId["event"]][
                "time"
              ]}
            </h5>
            <p>{events[eventId["event"]]["location"]}</p>
            <a class="pickpick" href="#/event/{eventId['event']}"
              ><button type="button" name="run_script">Read More...</button></a
            >
          </div>
        </div> -->
      <!-- {/each} -->
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

  .show {
    display: flex;
  }
</style>
