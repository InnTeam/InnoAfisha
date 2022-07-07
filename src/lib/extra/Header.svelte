<script>
  // import { page } from '$app/stores';
  // import Social from '$lib/Social/Social.svelte';
  // import { home } from "../../../api/pictures";
  // import github from 'github.png';

</script>

<header>
  <div class="corner">
    <div class="corner">
      27 August, Wednesday
    </div>
  </div>

  <nav>
    InnoAfisha
  </nav>

  <div class="corner social">
    <div class="social-block">
      <a href="/">
          <img src='img/favorite.png' alt="favorite" />
      </a>
      <a href="/">
          <img src='img/login.png' alt="log in" />
      </a>
  </div>
  </div>
</header>

<style>
  header {
		display: flex;
		justify-content: space-between;
		height: 4rem;
		align-items: center;
	}
	.corner {
		width: 3em;
		height: 3em;
		display: flex;
		align-items: center;
		justify-content: center;
		width: fit-content;
		height: 100%;
	}
	nav {
		display: flex;
		justify-content: center;
    font-size: x-large;
		/* margin-left: 8.9rem; */
	}
	/* ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}
	li {
		position: relative;
		height: 100%;
	}
	.active a{
		color: var(--accent-color);
	} */
	img{
		width: 2.5em;
		height: 2.5em;
		object-fit: contain;
	}
	/* nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	} */
	a:hover {
		color: var(--accent-color);
	}
	@media (max-width: 720px){
		nav{
			margin-left: 0;
		}
		.corner.social {
            display: none;
        }
	}
</style>
