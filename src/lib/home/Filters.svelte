<script lang="ts">
	import ButtonContainer from "../extra/services/ButtonContainer.svelte";
	import Gallery from "../extra/services/Gallery.svelte";
	import eventFev from "../../main";
	import axios from "axios";
	import { push } from "svelte-spa-router";
	import Spinner from "../extra/services/Spinner.svelte";

	const types = ["all", "IT", "music", "culture", "cinema", "sport", "other"];

	let selected = "all";

	const filterSelection = (e) => (selected = e.target.dataset.name);

	let events = [];
	let colNames = [];
	let sourceJson = "events";

	async function getThings() {
		const res = await fetch(
			`https://innoafisha.pythonanywhere.com/api/v1/` + sourceJson,
		);
		const json = await res.json();

		if (res.ok) {
			setTimeout(() => {
				events = json;
				colNames = Object.keys(events[0]);

				return true;
			}, 0);
		}
	}

	let promise = getThings();

	$: addFavEvent = async (id) => {
		axios.defaults.headers.common[
			"Authorization"
		] = `Token ${document.cookie.replace(
			/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/,
			"$1",
		)}`;
		await axios
			.post(
				"https://innoafisha.pythonanywhere.com/api/v1/favourites",
				{
					event: id,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			)
			.then((res) => {
				eventFev[res.data.event] = res.data.id;
			})
			.catch(async () => {
				await push("#/auth");
				location.reload();
			});
	};

	async function deleteFavEvent(id) {
		let sourceDelete = eventFev[id];

		axios.defaults.headers.common[
			"Authorization"
		] = `Token ${document.cookie.replace(
			/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/,
			"$1",
		)}`;
		await axios.delete(
			"https://innoafisha.pythonanywhere.com/api/v1/favourites/" +
				sourceDelete,
		);
	}
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
							<div class="buttonLiked">
								<button
									type="addFavEvent"
									class="bLikedEv"
									on:click={() => {
										addFavEvent(event.id);
									}}
								>
									<!-- svelte-ignore a11y-missing-attribute -->
									<img
										class="likedEv"
										src="img/liked.svg"
										alt="like"
									/>
								</button>
								<button
									type="addFavEvent"
									class="bLikedEv"
									on:click={() => {
										deleteFavEvent(event.id);
									}}
								>
									<!-- svelte-ignore a11y-missing-attribute -->
									<img
										class="likedEv"
										src="img/dislike.svg"
										alt="dislike"
									/>
								</button>
							</div>
						</div>
					</div>
				{:else}
					<div class:show={selected === event["type"]} class="column">
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
							<div class="buttonLiked">
								<button
									type="addFavEvent"
									class="bLikedEv"
									on:click={() => {
										addFavEvent(event.id);
									}}
								>
									<!-- svelte-ignore a11y-missing-attribute -->
									<img
										class="likedEv"
										src="img/liked.svg"
										alt="like"
									/>
								</button>
								<button
									type="addFavEvent"
									class="bLikedEv"
									on:click={() => {
										deleteFavEvent(event.id);
									}}
								>
									<!-- svelte-ignore a11y-missing-attribute -->
									<img
										class="likedEv"
										src="img/dislike.svg"
										alt="dislike"
									/>
								</button>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</Gallery>
	{/await}
</main>

<style>
	@import url("https://fonts.googleapis.com/css2?family=Merriweather+Sans&display=swap");

	h4,
	p {
		font-family: "Merriweather Sans", sans-serif;
	}

	main {
		max-width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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

	.likedEv {
		width: 30px;
		height: auto;
	}

	.buttonLiked {
		text-align: end;
	}

	.bLikedEv {
		border: none;
		background-color: white;
	}

	.bLikedEv:hover {
		cursor: pointer;
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
		margin: 30px 10px 0;
		transition: 0.1s ease-in-out;
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
