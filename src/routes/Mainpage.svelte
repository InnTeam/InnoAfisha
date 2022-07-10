<script lang="ts">
	import Header from "../lib/extra/Header.svelte";
	import Router from "svelte-spa-router";
	import TextImage from "../lib/extra/services/TextImage.svelte";
	import Filters from "../lib/home/Filters.svelte";
	import Footer from "../lib/extra/Footer.svelte";

	import { onMount } from "svelte";
	import axios from "axios";

	onMount(async () => {
		axios.defaults.headers.common[
			"Authorization"
		] = `Token ${document.cookie.replace(
			/(?:(?:^|.*;\s*)access_token\s*\=\s*([^;]*).*$)|^.*$/,
			"$1",
		)}`;
		await axios.get(
			"https://innoafisha.pythonanywhere.com/api/v1/authusers/",
		);
	});
</script>

<main>
	<body>
		<Header />
		<TextImage />
		<Filters />
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
