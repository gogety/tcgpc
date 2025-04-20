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
			<img height="200px" src={finish.Image} alt={card.CardName} />
		</td>
		<td>
			<div style="font-weight: bold">{card.SetName}{card.Qualifiers.length>0?" ("+card.Qualifiers.join(",")+")":""}</div>
			<div>{finish.Finish}</div>
		</td>
	{/if}
	{#if !showImage}
		<td>
			<div style="font-weight: bold">{card.CardName}{card.Qualifiers.length>0?" ("+card.Qualifiers.join(",")+")":""}</div>
			<div>{card.SetName}</div>
			<div>{finish.Finish}</div>
		</td>
	{/if}
	<td>
		<div>{finish.Price}</div>
	</td>
	<td on:click={handleClick}> ❌ </td>
</tr>