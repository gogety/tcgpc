<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';
	import 'chartjs-adapter-date-fns'; // 👈 Required adapter import
	import type { Card } from './models';
	export let card: Card;
  export let finish: string = ''; // optional to filter on specific qualifier

	let canvasEl;

	const avg = [
		[1749081600000, 37.5],
		[1749168000000, 22.67],
		[1749254400000, 22.43]
		// ...
	];

	const low = [
		[1749081600000, 25],
		[1749168000000, 22.5],
		[1749254400000, 22.2]
		// ...
	];

	async function fetchPriceHistory(cardName: String, setCode: String, collectorNumber: String) {
		const response = await fetch(
			`/api/priceHistory?cardName=${cardName}&setCode=${setCode}&collectorNumber=${collectorNumber}`
		);
		if (response.status === 404) {
			throw new Error('No price history found.');
		} else if (response.status !== 200) {
			throw new Error(response.statusText);
		}
		return await response.json();
	}

	onMount(async () => {
		// const avgData = avg.map(([ts, value]) => ({ x: new Date(ts), y: value }));
		// const lowData = low.map(([ts, value]) => ({ x: new Date(ts), y: value }));
		const data = await fetchPriceHistory(card.CardName, card.SetCode, card.CollectorNumber);
		if (!data) {
			console.error('No data found for the specified card.');
			return;
		}
		const market = data?.market?.map(([ts, value]) => ({ x: new Date(ts), y: value }));
		const market_foil = data?.market_foil?.map(([ts, value]) => ({ x: new Date(ts), y: value }));

		const valuesMin = [market?.[0]?.x, market_foil?.[0]?.x].filter((v) => v !== undefined);
		const minimum = valuesMin.length > 0 ? Math.min(...valuesMin) : undefined;
		const valuesMax = [
			market?.[market?.length - 1]?.x,
			,
			market_foil?.[market_foil?.length - 1]?.x
		].filter((v) => v !== undefined);
		const maximum = valuesMax.length > 0 ? Math.max(...valuesMax) : undefined;
    
    let finishFilter = finish.toLowerCase();

		const datasets = [];
    if (!['non-foil','foil'].includes(finishFilter)){
      console.warn(`Invalid qualifier: ${finish}. Valid options are 'non-foil' or 'foil'.`);
      finishFilter = ''; // Reset qualifier if not valid
    }
    
		if ((!finishFilter && market) || (finishFilter === 'non-foil' && market)){
			datasets.push({
				label: 'Regular',
				data: market,
				borderColor: 'blue',
				backgroundColor: 'rgba(0, 0, 255, 0.1)',
				fill: true,
				pointRadius: 0
			});
		}

		if ((!finishFilter && market_foil) || (finishFilter === 'foil' && market_foil)) {
			datasets.push({
				label: 'Foil',
				data: market_foil,
				borderColor: 'green',
				backgroundColor: 'rgba(0, 255, 0, 0.1)',
				fill: true,
				pointRadius: 0
			});
		}

		new Chart(canvasEl, {
			type: 'line',
			data: {
				datasets: datasets
			},
			options: {
				parsing: false,
				responsive: true,
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'day'
						},
						title: { display: false, text: 'Date' },
						min: minimum, // one day before first
						max: maximum // one day after last
					},
					y: {
						title: { display: false, text: 'Price ($)' },
						beginAtZero: false
					}
				},
				interaction: {
					mode: 'nearest', // Show all datasets at the hovered X index
					intersect: false, // Don’t require direct point hit,
					axis: 'x' // Show all datasets at the hovered X index
				},
				plugins: {
					tooltip: {
						mode: 'nearest', // Also applies to tooltips
						intersect: false
					},
					legend: {
            display:false,
						position: 'bottom', // or 'bottom' / 'left' / 'right'
						labels: {
							font: {
								size: 10 // 👈 smaller font size
							},
							boxWidth: 12, // 👈 smaller color box
              boxHeight: 1,
							padding: 8 // 👈 less spacing between items
						}
					}
				}
			}
		});
	});
</script>

<canvas class="chart-container" bind:this={canvasEl}></canvas>

<style>
	.chart-container {
		width: 100%;
		max-width: 1080px; /* 🔒 Limit chart width */
		max-height: 90vh; /* 🔒 Prevent overflow on page */
		margin: auto;
	}

	canvas {
		width: 100% !important;
		height: auto !important;
	}
</style>
