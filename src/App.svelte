<script lang="ts">
	import Forms from "./Forms.svelte";
	import FormsLogin from "./FormsLogin.svelte";
	import Panels from "./Panels.svelte";
</script>

<main>
	<div class="container">
		<div class="mainPage" />
		<div class="forms-container">
			<div class="signin-signup">
				<FormsLogin />
				<Forms />
			</div>
		</div>
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

	.forms-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }

    .signin-signup {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        left: 75%;
        width: 50%;
        transition: 1s 0.7s ease-in-out;
        display: grid;
        grid-template-columns: 1fr;
        z-index: 5;
    }
</style>
