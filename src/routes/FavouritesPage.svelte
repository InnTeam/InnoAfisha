<script lang="ts">
	import Header from "../lib/extra/Header.svelte";
	import Footer from "../lib/extra/Footer.svelte";
    import Favourites from "../lib/favourites/Favourites.svelte";
	import { onMount } from "svelte";
	import axios from "axios";

	onMount(async () => {
		axios.defaults.headers.common["Authorization"] = `Token ${document.cookie.replace(/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`;
	})
</script>

<main>
	<body>
		<Header />
		<Favourites/>
		<Footer />
	</body>
</main>

<style>
	body {
		background-color: #c2ecbf;
		color: #1f3e24;
		transition: background-color 0.3s;
	}
</style>
