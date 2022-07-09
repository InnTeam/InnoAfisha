<script lang="ts">
	import Header from "../lib/extra/Header.svelte";
	import TextImage from "../lib/extra/TextImage.svelte";
	import Filters from "../lib/filters/Filters.svelte";
	import Footer from "../lib/extra/Footer.svelte";
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
