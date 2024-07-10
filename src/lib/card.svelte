<script lang=ts>
	import type { Card } from "./models";

  export let card: Card;
  export let showImage: boolean;
</script>

  <tr>
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
      <div style="font-weight: bold">{card.SetName}</div>
      <table>
      {#each card.Values as value}
        <tr>
          <td>{value.Price}</td>
          <td>{value.Finish}</td>
          <td>{value.InStock?"In Stock":"Out of stock"}</td>
        </tr>  
      {/each}
      </table>
      
      <!-- {card.Values} -->
    </td>
  </tr>