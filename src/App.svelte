<script lang="ts">
	import Header from './lib/extra/Header.svelte';
</script>

<Header />
<main>
	<div class="mainPage" />

	<!-- <div class="container">
		<div class="mainPage" />
		
	</div> -->
</main>

<style>
	.mainPage {
		width: 100%;
		height: 100vh;
		background: url(../img/background.webp) center no-repeat;
		background-size: cover;
	}

	/* .container {
		position: relative;
		width: 100%;
		background-color: rgb(58, 58, 58);
		min-height: 100vh;
		overflow: hidden;
	} */
</style>
