<script lang="ts">
	import Header from "../lib/extra/Header.svelte";
	import Footer from "../lib/extra/Footer.svelte";
	import EventLoad from "../lib/event/eventLoad.svelte";
	export let params;
</script>

<main>
	<body>
		<Header />
		<EventLoad params={params.id} />
		<div class="spacespace" />
		<Footer />
	</body>
</main>

<style>
	body {
		background-color: #c2ecbf;
		padding: 0;
		margin: 0;
	}
	.spacespace {
		height: 30px;
	}
</style>
