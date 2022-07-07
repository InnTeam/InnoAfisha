<script>
	import { images } from './imgData.js';
	import { categories } from './imgData.js';
	
	import ButtonContainer from './ButtonContainer.svelte';
	import Gallery from './Gallery.svelte';
	
	let selected = "all";
	
	const filterSelection = (e) => selected = e.target.dataset.name;
</script>

<main>
	<ButtonContainer>
		{#each categories as category}
			<button class:active={selected === category} 
							class="btn" 
							data-name={category} 
							on:click={filterSelection}>
				{category}
			</button>
		{/each}
	</ButtonContainer>

	<!-- Portfolio Gallery Grid -->
	<Gallery>
		{#each images as {name, url, keyword, descr}}	
			{#if selected === "all"}
				<div class="show column">
					<div class="content">
						<img src={url} alt={name} style="width:100%">
						<h4>{name}</h4>
						<p>{descr}</p>
					</div>
				</div>
			{:else}
				<div class:show={selected === keyword} class="column">
					<div class="content">
						<img src={url} alt={name} style="width:100%">
						<h4>{name}</h4>
						<p>{descr}</p>
					</div>
				</div>
			{/if}
		{/each}
	</Gallery>
</main>

<style>
/* Center website */
main {
  max-width: 100vw;
  display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
/* 	background-color: red; */
}
	
h1 {
	font-size: 2.8rem;
	font-weight: 100;
	margin: 0 0 10px;;
}

h4 {
  font-size: 2rem;
  margin: 0;
}
	
p {
	margin: 0 0 .5rem;
	position: relative;
}


/* Create three equal columns */
.column {
  width: 33.33%;
	display: none;
	justify-content: center;
	margin: 10px 0;
}


/* Content */
.content {
  background-color: white;
	margin: 5px;
  padding: 10px;
	width: 30vw;
	box-shadow: 1px 1px 5px black;
}
	
	img {
		min-height: 200px;
	}

/* The "show" class is added to the filtered elements */
.show {
  display: flex;
}

/* Style the buttons */
.btn {
	width: 150px;
	text-transform: uppercase;
	font-weight: 200;
	font-size: 1.2rem;
	letter-spacing: 1px;
	border: none;
	outline: none;
	margin: 5px;
	padding: 14px 16px 12px;
	background-color: white;
	border: 1px solid black;
	cursor: pointer;
	transition: .1s ease-in-out;
}


	/* Add a dark background color to the active button */
.btn:active,
.active {
	background-color: #000;
	color: white;
}

</style>