<script lang="ts">
	import type { Card, Finish } from './models';
	export let card: Card;
	export let finish: Finish;
	export let showImage: boolean;

	// Dispatch event when a card is clicked
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('click');
	}
</script>

<tr>
	{#if showImage}
		<td>
			<img height="200px" src={card.Image} />
		</td>
		<td>
			<div style="font-weight: bold">{card.SetName}</div>
			<div>{finish.Finish}</div>
		</td>
	{/if}
	{#if !showImage}
		<td>
			<div style="font-weight: bold">{card.CardName}</div>
			<div>{card.SetName}</div>
			<div>{finish.Finish}</div>
		</td>
	{/if}
	<td>
		<div>{finish.Price}</div>
	</td>
	<td on:click={handleClick}> ❌ </td>
</tr>