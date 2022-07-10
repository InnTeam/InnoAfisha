<script>
  import Gallery from "../extra/services/Gallery.svelte";
  import Spinner from "../extra/services/spinner.svelte";
  import axios from "axios";
  import { push } from "svelte-spa-router";

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
    ).catch(async () => {
        await push("#/auth");
        location.reload();
    });
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
              <!-- <a class="pickpick" href="#/event/{event.id}"
                ><button type="button" name="run_script">Read More...</button
                ></a
              > -->
            </div>
          </div>
          {/if}
      {/each}
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
</style>
