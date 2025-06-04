import { error, json } from '@sveltejs/kit';
import NodeCache from 'node-cache';
import { Card } from '$lib/models';

const CACHE_DURATION = 3600; // 1 hour in seconds
const cache = new NodeCache({ stdTTL: CACHE_DURATION});
const baseUrl = 'https://facetofacegames.com/';

async function fetchData(searchTerm:string, page:number=1, pageSize:number=25) {
  
  const options = {
    method: 'GET', // Specify the method
    headers: {
      'Content-Type': 'application/json', // Specify the content type
    }
  };
  
  const f2furl = `${baseUrl}/apps/prod-indexer/search/keyword/${searchTerm}/pageSize/${pageSize}/page/${page}`;
  const response = await fetch(f2furl, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  const resultsFromServer = result.hits
  if (!resultsFromServer || resultsFromServer?.total?.value === 0) {
    return null;
  }

  return {...resultsFromServer, moreToLoad: resultsFromServer?.total?.value > pageSize};
}

/** @type {import('./$types').RequestHandler} */ 
export async function GET({ url }) {
  let searchTerm = url.searchParams.get('term');
  if (!searchTerm) {
    return error(400, 'Missing search term');
  }
  else
  {
    searchTerm = searchTerm.trim().toLowerCase();
  }
  // return array of value using new Response
  // return new Response(JSON.stringify({ results:["test1"] }));

  // try to get cached data for the search first
  let data = cache.get(searchTerm);
  if (data){
    console.log("got cached data");
    return json(data);
  }

  // if unable to get cached data, fetch it from the API
  if (!data) {
    try{
      data = await fetchData(searchTerm);

      if (!data) {
        error(404, 'No results found');
      }
    }
    catch (err) {
      console.error('Error fetching data:', err);
      error(err.status, `Error fetching data ${err}`);
    }
  }   

  const cards = data.hits.map((c) => {
    return {
      CardName: c._source["Card Name"],
      Image: c._source.media[0].url,
      SetName: c._source.Set,
      ReleaseDate: c._source.General_Release_Date,
      Link: `${baseUrl}/${c._source.handle}`,
      Qualifiers: c._source["Alternate Art Qualifier"],
      CollectorNumer: c._source["Collector Number"],
      Values: c._source.variants.filter((options) => options.selectedOptions[0].value == 'NM').map((v) => {
        return {
          Price: v.price,
          InStock: v.inventoryQuantity > 0, 
          Finish: c._source.Finish, 
          Image: c._source.media[0].url
        }
      })
    } as Card
  });

  // merge cards by set name and collector number. Add the values to the first card
  const mergedCards = [];
  const cardMap = new Map();

  for (const card of cards) {
    const key = `${card.SetName}-${card.CollectorNumer}`;
    if (cardMap.has(key)) {
      const existingCard = cardMap.get(key);
      existingCard.Values.push(...card.Values);
    } else {
      cardMap.set(key, card);
      mergedCards.push(card);
    }
  }

  // Remove cards that do not have values
  const filteredCards = mergedCards.filter((card) => card.Values.length > 0);
  // Sort cards by the finish in their values
  filteredCards.forEach((card) => {
    try{
      card.Values?.sort((a, b) => b?.Finish?.localeCompare(a?.Finish, undefined, { numeric: true }));
    }
    catch (err) {
      console.error(`Error sorting values for card ${card.CardName}:`, err);
    }
    // Set the card image to the first value image
    if (card.Values?.length > 0) {
      card.Image = card.Values[0].Image;
    }
  });

  if (filteredCards){
    cache.set(searchTerm, filteredCards)
  }

  return json(filteredCards);
}


// This handler will respond to PUT, PATCH, DELETE, etc.
/** @type {import('./$types').RequestHandler} */
export async function fallback({ request }) {
  return json([`I caught your ${request.method} request but will do nothing about it!`]);
}
