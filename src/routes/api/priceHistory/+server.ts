import { error, json } from '@sveltejs/kit';
import NodeCache from 'node-cache'; 

const CACHE_DURATION = 3600*12; // 1/2 day in seconds
const cache = new NodeCache({ stdTTL: CACHE_DURATION });
const baseUrl = 'https://api.mtgstocks.com';
const options = {
  method: 'GET', // Specify the method
  headers: {
    'Content-Type': 'application/json', // Specify the content type
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3' // Add a User-Agent header
  }
};

async function fetchPrintDetails(id: string) {
  if (!id) {  
    throw new Error('Id is null when fetching print details');
  }

  const printsURL = `${baseUrl}/prints`;

  const response = await fetch(`${printsURL}/${id}`, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  return result;
}

async function getPrices(id: string) {
  if (!id) {  
    throw new Error('Id is null when fetching prices');
  }
  
  const pricesURL = `${baseUrl}/prints/${id}/prices`;
  
  const response = await fetch(pricesURL, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  return result;
}

async function search(cardName: string) {
  if (!cardName) {  
    throw new Error('Card Name is required');
  }
  
  const printsURL = `${baseUrl}/search/autocomplete`;

  const response = await fetch(`${printsURL}/${cardName}`, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  console.log(result);
  return result;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const cardName = url.searchParams.get('cardName');
  if (!cardName) {
    return error(400, 'Missing card name');
  }
  const setCode = url.searchParams.get('setCode');
  if (!setCode) {
    return error(400, 'Missing set code');
  } 
  const collectorNumber = url.searchParams.get('collectorNumber'); 
  if (!collectorNumber) {
    return error(400, 'Missing collector number');
  } 

  let printDetails; 
  let searchResult; 
  try {
    // Check cache details first
    debugger;
    const cacheKey = `${cardName}-${setCode}-${collectorNumber}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData){
      console.log("got cached data");
      return json(cachedData);
    }

    // Search and return 
    searchResult = await search(cardName)
    // console.log('Search result:', searchResult);
    // Fetch first print details
    const print = searchResult?.filter(res => res.type === 'print')[0];
    if (!print) {
      error(404, 'No print found for the given card name');
    }
    printDetails = await fetchPrintDetails(print.id);
    if (!printDetails) {
      error(404, 'Print details not found for the given card name');
    }
    // console.log('Print details:', printDetails);
    
    // Identify whether this is the right print or find the right one
    let printID = null;
    debugger;
    if (printDetails.card_set?.abbreviation?.toLowerCase() === setCode.toLowerCase() && printDetails.collector_number === collectorNumber) {
      // This is the right printing
      printID = printDetails.id;
    }
    else {
      // Not the right printing, check the other sets
      // console.log('Searching for matching print in search results...');
      printID = printDetails.sets?.filter(set => set.abbreviation?.toLowerCase() == setCode.toLowerCase() && set.collector_number == collectorNumber)?.[0]?.id;
    } 
    if (!printID) {
      error(404, 'No matching print found for the given set code and collector number');
    }

    // Fetch prices for the identified print
    const prices = await getPrices(printID);
    if (!prices) {
      error(404, 'No prices found for the identified print');
    }
    // console.log('Prices:', prices);
    cache.set(cacheKey,prices); // Cache the result
    return json(prices)
  }
  catch (err) {
    console.error('Error fetching data:', err);
    error(err.status, `Error fetching data ${err}`);
  }

  return json(printDetails);
}


// This handler will respond to PUT, PATCH, DELETE, etc.
/** @type {import('./$types').RequestHandler} */
export async function fallback({ request }) {
  return json([`I caught your ${request.method} request but will do nothing about it!`]);
}
