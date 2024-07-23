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

  async function processPicture(imageData) {
    const response = await fetch('/api/processPicture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });

    if (response.status !== 200) {
      errorFromBackend = response.statusText;
    } else {
      const data = await response.json();
      // Handle the response data if needed
      console.log(data);
    }
  }

  async function captureImage() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await new Promise(resolve => video.onloadedmetadata = resolve);
      video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/png');
      processPicture(imageData);

      // Stop all video streams
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error capturing image:', error);
      alert('Failed to capture image. Please use the file upload option.');
    }
  }  

  function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(loadEvent) {
      const imageData = loadEvent.target.result;
      processPicture(imageData);
    };
    reader.readAsDataURL(file);
  }

  onDestroy(() => {
    clearTimeout(timeout);
  });

</script>

Seach: <input type="text" bind:value={searchTerm}> 
<input type="checkbox" bind:checked={showImages}> Show Images
<button on:click={captureImage}>Take Picture</button>
<input type="file" accept="image/*" on:change={handleFileUpload}>
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