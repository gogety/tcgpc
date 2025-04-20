<script lang=ts>
	import type { Card } from "./models";
  export let card: Card;
  export let showImage: boolean;

  // Dispatch event when a card is clicked
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

  function handleClick() {
		dispatch('click');
	}
</script>

  <tr on:click={handleClick}>
  <!-- <tr> -->
    <td>
      {#if showImage}
        <img height="200px" src={card.Image}>
      {/if}
      {#if !showImage}
        {card.CardName}
      {/if}
    </td>
    <!-- <td>{card.CardName}</td> -->
    <td>
      <div style="font-weight: bold">{card.SetName}{card.Qualifiers.length>0?" ("+card.Qualifiers.join(",")+")":""}</div>
      <table>
      {#each card.Values as value}
        <tr>
          <td>{value.Finish}</td>
          <td>{value.Price}</td>
          <td>{value.InStock?"In Stock":"Out of stock"}</td>
        </tr>  
      {/each}
      </table>
      
      <!-- {card.Values} -->
    </td>
  </tr>