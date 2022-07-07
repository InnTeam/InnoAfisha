<script lang="ts">
	import Header from './lib/extra/Header.svelte';
	import Filters from './lib/main/Filters.svelte';
</script>

<Header />
<main>
	<div class="title">
		<p>InnoAfisha</p>
	</div>
	<Filters />
</main>

<style>
	.title {
		width: 100%;
		height: 50vh;
		background: url(../img/background.webp) center no-repeat;
		background-size: cover;
	}
</style>
