<script lang="ts">
	import Cart from '$lib/cart.svelte';
	import Search from '$lib/search.svelte';
	import { onMount } from 'svelte';

	let showImages = true;
	let cart:any[] = []; // List to selected cards finishes
	let currentPage = 'search'; // Tracks the current page ('search' or 'cart')

	let isMounted = false;
	onMount(() => {
    // Load cart from localStorage if it exists
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      cart = JSON.parse(storedCart);
    }
		isMounted = true;
  });
	
	$: if (isMounted && cart){
		localStorage.setItem('cart', JSON.stringify(cart));
	};

	// Function to handle adding a finish to the list
	const addToCart = (cardToAdd, value) => {
		if (value) {
			cart = [...cart, { card: cardToAdd, finish: value }];
		}
	};

	const clearCart = () => {
		cart = [];	
		localStorage.removeItem('cart');
	}

	  // Calculate the total price of the cart
	$: totalPrice = cart.reduce((sum, item) => sum + item?.finish?.Price, 0);

	const removeFromCart = (item) => {
		const index = cart.indexOf(item);
		cart.splice(index, 1);
		cart = cart;
	}
</script>

{#if currentPage === 'search'}
	<Search {addToCart} {showImages} />
{/if}

{#if currentPage === 'cart'}
	<Cart {cart} {showImages} {removeFromCart} {totalPrice} {clearCart}/>
{/if}

<div class="tab-bar">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="tab {currentPage === 'search' ? 'active' : ''}"
		on:click={() => (currentPage = 'search')}
	>
		<span class="tab-icon">🔍 Search</span>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="tab {currentPage === 'cart' ? 'active' : ''}" on:click={() => (currentPage = 'cart')}>
		<span class="tab-icon"
			>⭐ Saved
			{#if cart.length > 0}
				(${totalPrice.toFixed(2)})
			{/if}
		</span>
	</div>
	<input type="checkbox" bind:checked={showImages} title="Show Images" />

</div>

<style>
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
</style>
