<script lang="ts">
  import CartItem from './cartItem.svelte';

  export let cart: [];
  export let showImages: boolean;
  export let removeFromCart: Function;
  export let totalPrice: number;
  export let clearCart: Function;
</script>

<h1>
  Cart
  {#if cart.length > 0}
    (${totalPrice.toFixed(2)})
    <button on:click={() => clearCart()} style="margin-left: 10px;">Clear Cart</button>
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
