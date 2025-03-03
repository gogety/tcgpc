<script>
	import Card from '$lib/card.svelte';
	import CartItem from '$lib/cartItem.svelte';
	import Modal from '$lib/modal.svelte';

	let showImages = true;
	let searchTerm = '';
	let searchInputElement; // Reference to the search input element
	let timeout;
	let errorFromBackend = null;
	let results = [];
	let cart = []; // List to selected cards finishes
	let showModal = false;
	let selectedCard = null;
	let currentPage = 'search'; // Tracks the current page ('search' or 'cart')

	// Calculate the total price of the cart
	$: totalPrice = cart.reduce((sum, item) => sum + item?.finish?.Price ?? 0, 0);

	// Function to handle adding a finish to the list
	function addToCart(value) {
		if (value) {
			cart = [...cart, { card: selectedCard, finish: value }];
		}
		showModal = false;
		selectedCard = null;
	}

	function clearSearch() {
		searchTerm = ''; // Clear the input value
		if (searchInputElement) {
			searchInputElement.focus(); // Set focus back on the search input
		}
	}

	function openModal(card) {
		selectedCard = card;
		showModal = true;
	}

	function removeFromCart(item) {
		const index = cart.indexOf(item);
		cart.splice(index, 1);
		cart = cart;
	}

	// on searchTerm update, fetch data from the API
	$: if (searchTerm) {
		const term = searchTerm;
		// debounce for 500 ms not to spam the API
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => search(term), 501);
	} else {
		if (timeout) clearTimeout(timeout);
		results = [];
		errorFromBackend = null;
	}

	async function search(term) {
		const response = await fetch(`/api/search?term=${term}`);
		if (response.status !== 200) {
			errorFromBackend = response.statusText;
		} else {
			results = await response.json();
			errorFromBackend = null;
		}
	}
</script>

{#if currentPage === 'search'}
	{#if errorFromBackend != null}
		<div>
			Error: {errorFromBackend}
		</div>
	{/if}
	<table>
		{#each results as result}
			<Card card={result} showImage={showImages} on:click={() => openModal(result)} />
		{/each}
	</table>

	<Modal show={showModal} onClose={addToCart} card={selectedCard} />

	<!-- Fixed search bar -->
	<div class="search-bar">
		<input
			type="text"
			bind:value={searchTerm}
			placeholder="Search..."
			bind:this={searchInputElement}
		/>
		<button class="clear-button" on:click={clearSearch}>✖</button>
		<input type="checkbox" bind:checked={showImages} title="Show Images" />
	</div>
{/if}

{#if currentPage === 'cart'}
	<h1>
		Cart
		{#if cart.length > 0}
			(${totalPrice.toFixed(2)})
		{/if}
	</h1>
	<table>
		{#each cart as item}
			<CartItem
				card={item.card}
				finish={item.finish}
				showImage={showImages}
				on:click={() => removeFromCart(item)}
			/>
		{/each}
	</table>
{/if}

<div class="tab-bar">
	<div
		class="tab {currentPage === 'search' ? 'active' : ''}"
		on:click={() => (currentPage = 'search')}
	>
		<span class="tab-icon">🔍 Search</span>
	</div>
	<div class="tab {currentPage === 'cart' ? 'active' : ''}" on:click={() => (currentPage = 'cart')}>
		<span class="tab-icon"
			>🛒 Cart
			{#if cart.length > 0}
				(${totalPrice.toFixed(2)})
			{/if}
		</span>
	</div>
</div>

<style>
	#webcam {
		width: 100%;
		max-width: 600px;
	}
	#canvas {
		display: none;
	}

	input {
		font-size: 16px;
	}
	/* Page styles */
	main {
		padding-bottom: 60px; /* Reserve space for the bottom tab bar */
	}

	/* Bottom navigation bar */
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #ffffff;
		border-top: 1px solid #ddd;
		display: flex;
		justify-content: space-between;
		padding: 3px 0;
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		height: px;
	}
	.tab {
		flex: 1;
		text-align: center;
		padding: 5px;
		color: #888;
		font-size: 14px;
		cursor: pointer;
		transition: color 0.3s ease;
	}
	.tab.active {
		color: #007bff;
		font-weight: bold;
	}
	.tab-icon {
		display: block;
		font-size: 20px;
		margin-bottom: 5px;
	}

	/* Fixed search bar at the bottom */
	.search-bar {
		position: fixed;
		bottom: 52px; /* Place above the tab bar */
		left: 50%;
		transform: translateX(-50%);
		width: 90%;
		max-width: 600px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #ffffff;
		border: 1px solid #ddd;
		border-radius: 25px;
		padding: 5px 15px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}
	.search-bar input[type='text'] {
		flex: 1;
		border: none;
		outline: none;
		font-size: 16px;
	}
	.search-bar input[type='checkbox'] {
		margin-left: 10px;
	}

	.clear-button {
		background: none;
		border: none;
		color: #888;
		font-size: 16px;
		cursor: pointer;
		margin-left: 8px;
		padding: 5px;
		border-radius: 50%;
		transition: background-color 0.3s ease;
	}
	.clear-button:hover {
		background: #f0f0f0;
		color: #555;
	}
</style>
