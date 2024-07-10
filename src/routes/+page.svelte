<script>
	import { onDestroy } from "svelte";
	import Error from "./+error.svelte";
	import Card from "$lib/card.svelte";

  let showImages = true;
  let searchTerm = "";
  let timeout;
  let errorFromBackend = null;
  /**
	 * @type {any}
	 */
  let results = [];

  // on searchTerm update, fetch data from the API
  $: if (searchTerm) {
    const term = searchTerm;
    // debounce for 500 ms not to spam the API
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(()=>search(term), 501);
  }
  else{
    if (timeout) clearTimeout(timeout);
    results = [];
    errorFromBackend = null;
  }
  async function search(term) {
    const response = await fetch(`/api/search?term=${term}`);
    if (response.status !== 200) {
      errorFromBackend = response.statusText;
    }
    else {
      results = await response.json();
      errorFromBackend = null;
    }
  }

  onDestroy(() => {
    clearTimeout(timeout);
  });

</script>

Seach: <input type="text" bind:value={searchTerm}> <input type="checkbox" bind:checked={showImages}> Show Images
{#if errorFromBackend != null}
<div>
  Error: {errorFromBackend}
</div>
{/if}
<table>
  {#each results as result}
    <Card card={result} showImage={showImages}/>
  {/each}
</table>