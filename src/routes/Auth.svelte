<script lang="ts">
	import Forms from "../lib/loginpage/Forms.svelte";
	import FormsLogin from "../lib/loginpage/FormsLogin.svelte";
	import Panels from "../lib/loginpage/Panels.svelte";
</script>

<main>
	<div class="containerA">
		<div class="mainPage" />
		<div class="forms-container">
			<div class="signin-signup">
				<FormsLogin />
				<Forms />
			</div>
		</div>
		<Panels />
	</div>
	<script lang="ts">
		if (true) {
			const sign_in_btn = document.querySelector("#sign-in-btn");
			const sign_up_btn = document.querySelector("#sign-up-btn");
			const containerA: HTMLElement =
				document.querySelector(".containerA");
			sign_up_btn.addEventListener("click", () => {
				containerA.classList.add("sign-up-mode");
			});
			sign_in_btn.addEventListener("click", () => {
				containerA.classList.remove("sign-up-mode");
			});
		} else {
			sign_up_btn.addEventListener("click", () => {
				containerA.classList.add("sign-up-mode");
			});
			sign_in_btn.addEventListener("click", () => {
				containerA.classList.remove("sign-up-mode");
			});
		}
	</script>
</main>

<style>
	.mainPage {
		width: 100%;
		height: 100vh;
		background: url(../img/background.webp) center no-repeat;
		background-size: cover;
	}

	.containerA {
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
