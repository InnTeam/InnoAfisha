<script lang="ts">
	import Router from "svelte-spa-router";
	import EventPage from "./routes/EventPage.svelte";
	import MainPage from "./routes/MainPage.svelte";
	import Auth from "./routes/Auth.svelte";
	let routes = {
		"/": MainPage,
		"/auth": Auth,
		"/event/:id": EventPage,
	};
</script>

<main>
	<Router {routes} />
</main>
