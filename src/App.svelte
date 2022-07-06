<script lang="ts">
	import Forms from "./Forms.svelte";
	import Panels from "./Panels.svelte";
</script>

<main>
	<div class="container">
		<div class="mainPage" />
		<Forms />
		<Panels />
	</div>
</main>

<style>
	.mainPage {
		width: 100%;
		height: 100vh;
		background: url(../img/background.webp) center no-repeat;
		background-size: cover;
	}

	.container {
		position: relative;
		width: 100%;
		background-color: rgb(58, 58, 58);
		min-height: 100vh;
		overflow: hidden;
	}
</style>
