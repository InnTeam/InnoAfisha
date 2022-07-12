<script lang="ts">
	let dateTime = String(new Date());
	dateTime = dateTime.slice(0, 15);
	import { push } from "svelte-spa-router";

	$: logoutFrom = async () => {
		document.cookie = "access_token" + "=; Max-Age=-1;";
		location.reload();
	};
	$: loginForm = async () => {
		await push("#/auth");
		location.reload();
	};
</script>

<header>
	<div class="corner">
		<div class="corner">{dateTime}</div>
	</div>

	<nav
		class="title"
		style="font-family: 'Lemon', cursive; font-size: 30px; color: #1F3E24;"
	>
		<a class="titleLink" href="#/">InnoAfisha</a>
	</nav>

	<div class="corner_social">
		<div class="social_block">
			<a
				class="liked"
				href="#/favourites"
				style="text-decoration: none; color: #4E7149"
			>
				<!-- svelte-ignore a11y-missing-attribute -->
				<img
					src="img/favourite.png"
					width="30px"
					height="auto"
					alt="favourite"
				/></a
			>
			{#if !document.cookie}
				<button
					type="loginForm"
					class="btnLogin"
					on:click={() => {
						loginForm();
					}}
					style="text-decoration: none; border: none"
				>
					<!-- svelte-ignore a11y-missing-attribute -->
					<img
						src="img/logout.svg"
						width="28px"
						height="auto"
						alt="logout"
					/></button
				>
			{:else}
				<button
					type="logoutFrom"
					class="btnLogout"
					on:click={() => {
						logoutFrom();
					}}
					style="text-decoration: none; border: none"
				>
					<!-- svelte-ignore a11y-missing-attribute -->
					<img
						src="img/login.png"
						width="19px"
						height="auto"
						alt="login"
					/></button
				>
			{/if}
		</div>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		height: 4rem;
		align-items: center;
		background-color: #7aae72;
	}

	.btnLogout {
		background-color: #7aae72;
	}

	.btnLogout:hover {
		cursor: pointer;
	}

	.btnLogin {
		background-color: #7aae72;
	}

	.btnLogin:hover {
		cursor: pointer;
	}

	.titleLink {
		text-decoration: none;
		color: #1f3e24;
	}

	.corner {
		display: flex;
		align-items: center;
		justify-content: center;
		width: fit-content;
		height: 100%;
		font-family: "M PLUS 2", sans-serif;
		color: #1f3e24;
		padding-left: 20px;
		font-size: 20px;
	}

	nav {
		display: flex;
		justify-content: center;
		font-size: x-large;
	}

	a:hover {
		color: var(--accent-color);
	}

	@media (max-width: 720px) {
		nav {
			margin-left: 0;
		}
	}

	.title {
		margin-right: 4rem;
	}

	.corner_social {
		margin-right: 3rem;
	}

	.liked {
		margin-right: 0.6rem;
	}
</style>
