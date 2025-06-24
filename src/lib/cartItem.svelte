<script lang="ts">
	import LineChart from './lineChart.svelte';
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

<style>
	 .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>

<tr>
	{#if showImage}
		<td>
			<img height="200px" src={finish.Image} alt={card.CardName} />
		</td>
		<td>
			<div class="row">
				<span style="font-weight: bold">{finish.Price}$</span>
				<label on:click={handleClick}>❌</label>
			</div>
			<div>
				{card.SetName}{card.Qualifiers.length > 0 ? ' (' + card.Qualifiers.join(',') + ')' : ''}
			</div>
			<div>{finish.Finish} ({finish.InStock ? 'In stock' : 'Out of stock'})</div>
			<LineChart {card} finish={finish.Finish} />
		</td>
	{/if}
	{#if !showImage}
		<td>
			<div style="font-weight: bold">
				{card.CardName}{card.Qualifiers.length > 0 ? ' (' + card.Qualifiers.join(',') + ')' : ''}
			</div>
			<div>{card.SetName}</div>
			<div>{finish.Finish} - {finish.InStock ? 'In stock' : 'Out of stock'}</div>
		</td>
		<td>
			<div>{finish.Price}</div>
		</td>
		<td on:click={handleClick}> ❌ </td>
	{/if}
</tr>