<script lang="ts">
	import Header from './lib/extra/Header.svelte';
	import Filters from './lib/filters/Filters.svelte';
	// import Footer from './lib/extra/Footer.svelte';
</script>

<main>
	<Header />
	<div class="title">
		<p>InnoAfisha</p>
	</div>
	<Filters />
	<!-- <Footer /> -->
</main>
<style>
	.title {
		width: 100%;
		height: 50vh;
		background: url(../img/background.webp) center no-repeat;
		background-size: cover;
	}
</style>
