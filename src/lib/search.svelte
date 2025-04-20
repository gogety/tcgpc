<script lang="ts">
	import Card from '$lib/card.svelte';
	export let showImages: boolean;
	export let addToCart: Function;

	let searchTerm = '';
	let errorFromBackend: string | null = null;
	let timeout:NodeJS.Timeout;
	let searchInputElement: HTMLInputElement; // Reference to the search input element
	let results: any[] = [];
	let selectedCard: Card | null = null;

	function clearSearch() {
		searchTerm = ''; // Clear the input value
		if (searchInputElement) {
			searchInputElement.focus(); // Set focus back on the search input
		}
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

	async function search(term:string) {
		const response = await fetch(`/api/searchShopify?term=${term}`);
		if(response.status === 404) {
			errorFromBackend = 'No results.';
		} 
		else if (response.status !== 200) {
			errorFromBackend = response.statusText;
		} else {
			results = await response.json();
			errorFromBackend = null;
		}
	}
</script>

{#if errorFromBackend != null}
	<div>
		Error: {errorFromBackend}
	</div>
{/if}

<table>
	{#each results as result}
		<Card
			card={result}
			showImage={showImages}
			on:click={() => {
				selectedCard = result;
			}}
		/>
	{/each}
</table>

<!--Modal to view details, add to cart or collection--> 
{#if selectedCard}
	<button
		class="overlay"
		on:click={() => {
			selectedCard = null;
		}}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				selectedCard = null;
			}
		}}
		aria-label="Close modal"
	></button>

	<div class="modal">
		<div style="display: flex; justify-content: space-between; align-items: center;">
			<h3>{selectedCard.SetName}</h3>
			<span 
				style="cursor: pointer; font-size: 20px;" 
				on:click={() => {
					selectedCard = null;
				}}
			>❌</span>
		</div>
		<div>
			<div style="overflow-x: auto; max-width: 100%;">
				<table>
					<tr>
						{#each selectedCard.Values as value}
						<td style="vertical-align: top;">
							<div class="card-container">
								<img class="card-image" src={value.Image} alt={selectedCard.SetName} />
								<div class="card-button">
									<button
										on:click={() => {
											setTimeout(() => (selectedCard = null), 0);
											addToCart(selectedCard, value);
										}}
									>
										Add {value.Finish} (${value.Price})
									</button>
								</div>
							</div>
						</td>
						{/each}
					</tr>
				</table>
			</div>
		</div>
		<!-- <button on:click={handleClose}>Close</button> -->
	</div>
{/if}

<!-- Fixed search bar -->
<div class="search-bar">
	<input
		type="text"
		bind:value={searchTerm}
		placeholder="Search..."
		bind:this={searchInputElement}
	/>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="clear-button" on:click={clearSearch}>✖</div>
</div>

<style>
	input {
		font-size: 16px;
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

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
		padding: 0px 10px 10px 10px;
		z-index: 1000;
		width: 90%;
		align-content: center;
		max-height: 100%;
		overflow-y: hidden;
		overflow-x: auto; 
		max-width: 100%;
	}
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		touch-action: none; /* block gestures */
		overflow: hidden;
	}

	button {
		/* height: 30px; */
		font-size: 18px;
		width: 100%;
		height: 50px;
	}
	.card-container {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		height: 405px; /* Ensure consistent height for alignment */
	}

	.card-image {
		max-height: 350px;
		object-fit: contain;
	}
</style>
