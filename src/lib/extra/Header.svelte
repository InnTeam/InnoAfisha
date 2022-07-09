<script>

</script>

<header>
	<div class="corner">
        <div class="corner">27 August, Wednesday</div>
    </div>

    <nav
        class="title"
        style="font-family: 'Lemon', cursive; font-size: 30px; color: #1F3E24;"
    >
        InnoAfisha
    </nav>

    <div class="corner_social">
        <div class="social_block">
            <a
                class="liked"
                href="/"
                style="text-decoration: none; color: #4E7149"
            >
                <!-- svelte-ignore a11y-missing-attribute -->
                <img
                    src='img/favorite.png'
                    width="30px"
                    height="auto"
                /></a
            >
            <a href="#/auth" style="text-decoration: none; color: #4E7149">
                <!-- svelte-ignore a11y-missing-attribute -->
                <img src='img/login.png' width="19px" height="auto" /></a
            >
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

    .corner {
        width: 3em;
        height: 3em;
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
        margin-right: 12rem;
    }

    .corner_social {
        margin-right: 3rem;
    }

    .liked {
        margin-right: 0.6rem;
    }
</style>
