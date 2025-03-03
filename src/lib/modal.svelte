<script>
  export let show = true;
  export let onClose;
  export let card;

  function handleClose() {
    if (onClose) onClose();
  }
</script>

<style>
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
  }
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

   button {
    /* height: 30px; */
    font-size:18px;
    width: 150px;
  }
</style>

{#if show}
  <div class="overlay" on:click={handleClose}></div>
  <div class="modal">
    <h2>{card.SetName}</h2>
    <div>
      <table>
        <tr>
        <td>
        <img height="300px" src={card.Image}>
        </td>
        <td>
        {#each card.Values as value}
          <div>
            <button on:click={() => onClose(value)}><div>{value.Finish}</div>(${value.Price})</button>
          </div>
        {/each}
        </td>
        </tr>
      </table>
    </div>
    <!-- <button on:click={handleClose}>Close</button> -->
  </div>
{/if}