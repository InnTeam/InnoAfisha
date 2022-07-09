<script lang="ts">
	import Header from "../lib/extra/Header.svelte";
	import TextImage from "../lib/extra/TextImage.svelte";
	import Filters from "../lib/filters/Filters.svelte";
	import Footer from "../lib/extra/Footer.svelte";

	import { onMount } from "svelte";
	import axios from "axios";

	onMount(async () => {
		const response = await axios.get('https://innoafisha.pythonanywhere.com/api/v1/authusers/');

		if(response.status === 200) {
			console.log(response);
		}
	})
</script>

<main>
	<Header />
	<TextImage />
	<Filters />
	<Footer />
</main>

<style>
	:global(body) {
		background-color: #7aae72;
		color: #1f3e24;
		transition: background-color 0.3s;
	}
</style>
