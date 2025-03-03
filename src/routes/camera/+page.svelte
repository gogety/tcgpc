<script>
    import { onMount } from 'svelte';
  
    let videoElement;
    let canvasElement;
    let context;
    let isStarted = false;
    let errorMessage = '';
  
    async function startCamera() {
        console.log('Starting camera...');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            errorMessage = 'Camera API is not supported in this browser.';
            console.error(errorMessage);
            alert(errorMessage);
            return;
        }
  
        try {
            console.log('Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            console.log('Camera access granted.');
            videoElement.srcObject = stream;
  
            videoElement.addEventListener('loadedmetadata', () => {
                console.log('Metadata loaded.');
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                drawFrame();
            });
        } catch (err) {
            errorMessage = 'Error accessing camera: ' + err.message;
            console.error(errorMessage);
            alert(errorMessage);
        }
    }
  
    function drawFrame() {
        if (videoElement.paused || videoElement.ended) {
            return;
        }
  
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        // Add your overlay drawing code here
        context.fillStyle = 'rgba(255, 0, 0, 0.5)';
        context.fillRect(10, 10, 100, 100);
  
        requestAnimationFrame(drawFrame);
    }
  
    function handleStart() {
        if (!isStarted) {
            isStarted = true;
            startCamera();
        }
    }
  
    function captureImage() {
        const dataUrl = canvasElement.toDataURL('image/png');
        console.log('Captured image data URL:', dataUrl);
        sendImageForProcessing(dataUrl);
    }
  
    function sendImageForProcessing(imageData) {
        // Replace with actual processing logic
        console.log('Sending image for processing...');
        fetch('/api/processPicture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Image processed:', data);
			console.log(data?.documents?.[0]?.fields || "Nothing to see here");
            // Handle the processed data
        })
        .catch(error => {
            console.error('Error processing image:', error);
        });
    }
  
    onMount(() => {
        context = canvasElement.getContext('2d');
        // Attach the start function to a user interaction event
        document.addEventListener('click', handleStart, { once: true });
        console.log('Event listener added for user interaction.');
    });
  </script>
  
  <style>
    .video-container {
        position: relative;
        width: 100%;
        max-width: 640px;
        margin: auto;
    }
  
    video, canvas {
        width: 100%;
        height: auto;
    }
  
    canvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }
  
    .overlay-message {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        background-color: rgba(0, 0, 0, 0.7);
        padding: 10px;
        border-radius: 5px;
    }
  
    button {
        margin-top: 20px;
        display: block;
        width: 100%;
        max-width: 640px;
        padding: 10px;
        font-size: 18px;
        cursor: pointer;
    }
  </style>
  
  <div class="video-container">
    <video bind:this={videoElement} autoplay playsinline muted></video>
    <canvas bind:this={canvasElement}></canvas>
    {#if errorMessage}
        <div class="overlay-message">{errorMessage}</div>
    {:else}
        <div class="overlay-message">Tap to start camera</div>
    {/if}
  </div>
  <button on:click={captureImage} disabled={!isStarted}>Capture Image</button>
  