<script>
	import Gallery from "../extra/services/Gallery.svelte";
	import Spinner from "../extra/services/Spinner.svelte";
	import axios from "axios";
	import { push } from "svelte-spa-router";

	let eventsIds = [];
	let events = [];

	async function getThings() {
		axios.defaults.headers.common[
			"Authorization"
		] = `Token ${document.cookie.replace(
			/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/,
			"$1",
		)}`;
		let res = await axios
			.get("https://innoafisha.pythonanywhere.com/api/v1/favourites")
			.catch(async () => {
				await push("#/auth");
				location.reload();
			});
		eventsIds = res.data;
		res = await axios.get(
			`https://innoafisha.pythonanywhere.com/api/v1/events`,
		);
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
								<a class="pickpick" href="#/event/{event.id}">
									<img
										src={event["picture"]}
										alt=""
										style="width:100%"
									/>
								</a>
								<div class="containerName">
									<div
										class="imgTitle"
										style="text-align: center;"
									>
										<h4>{event["event_name"]}</h4>
									</div>
								</div>
								<div style="text-align: center;">
									<hr />
									<div class="descriptInfo">
										<p>{event["date"]}, {event["time"]}</p>
										<p>{event["location"]}</p>
									</div>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			{/each}
		</Gallery>
		<div class="nothingHere">
			<h1>
				Oops, there's nothing here... Like the events if you want to see
				more...
			</h1>
		</div>
	{/await}
</main>

<style>
	@import url("https://fonts.googleapis.com/css2?family=Merriweather+Sans&display=swap");

	h4,
	p {
		font-family: "Merriweather Sans", sans-serif;
	}

	h1 {
		margin-top: 20px;
	}

	main {
		max-width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.nothingHere {
		width: auto;
		height: 500px;
		display: flex;
		align-items: center;
	}

	.pickpick {
		position: relative;
		bottom: 0;
		text-decoration: none;
		color: #1f3e24;
	}

	.pickpick:hover {
		opacity: 0.8;
	}

	h4 {
		font-size: 2rem;
		margin: 0;
	}

	p {
		margin: 0 0 0.5rem;
		font-size: 1.2rem;
		position: relative;
	}

	.imgTitle {
		padding-top: 15px;
	}

	.containerName {
		display: grid;
		align-items: center;
		width: auto;
		height: 120px;
	}

	hr {
		margin-top: 15px;
		border: none; /* Убираем границу */
		background-color: #b3caaf; /* Цвет линии */
		color: #b3caaf; /* Цвет линии для IE6-7 */
		height: 2px; /* Толщина линии */
		width: 400px;
	}

	.descriptInfo {
		padding-top: 20px;
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
