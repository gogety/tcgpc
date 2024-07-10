import { error, json } from '@sveltejs/kit';
import NodeCache from 'node-cache';
import { Card } from '$lib/models';

const CACHE_DURATION = 3600; // 1 hour in seconds
const cache = new NodeCache({ stdTTL: CACHE_DURATION});

function setCache(key, data, duration) {
  const expiration = Date.now() + duration;
  localStorage.setItem(key, JSON.stringify({ data, expiration }));
}

function getCache(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { data, expiration } = JSON.parse(cached);
  if (Date.now() > expiration) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
}

async function fetchData(searchTerm) {
  const data = {
    Keyword: searchTerm,
    FacetSelections: {},
    PageNo: 1,
    ClientGuid: "30c874915d164f71bf6f84f594bf623f",
    IndexName: "",
    ClientData: { VisitorId: "e90656ad-bdac-4976-a463-790d79e6f43a" }
  };
  
  const options = {
    method: 'POST', // Specify the method
    headers: {
      'Content-Type': 'application/json', // Specify the content type
    },
    body: JSON.stringify(data) // Convert the data object to JSON string
  };
  
  const f2furl = 'https://essearchapi-na.hawksearch.com/api/v2/search';
  const response = await fetch(f2furl, options);
  const result = await response.json();
  const resultsFromServer = result.Results
  if (!resultsFromServer || resultsFromServer.length === 0) {
    return null;
  }

  return resultsFromServer;
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

  // if unable to get cached data, fetch it from the API
  if (!data) {
    try{
      data = await fetchData(searchTerm);
      console.log("got here");
      console.log(data);

      if (!data) {
        error(404, 'No results found');
      }
      cache.set(searchTerm, data)
    }
    catch (err) {
      console.error('Error fetching data:', err);
      error(500, 'Error fetching data');
    }
  }   
  // process the results (yes, even if cached)
  let resu = data.filter((f)=>f.Document["card name"]);
  resu.forEach((r) => {
    r.CardName = r.Document["card name"][0];
    if (r.Document["card name 2"]){
      r.CardName += " // " + r.Document["card name 2"][0];
    }
  })
  resu = resu.filter((r) => r.Document["card name"]);
  resu = resu.map((r) => ({
    SetName: r?.Document?.set?.[0] ?? "Unknown",
    ReleaseDate: r?.Document?.release_date_sort?.[0] ?? null,
    Link: r?.Document?.url_detail?.[0]?.replaceAll(" ","%20") ??  "Unknown",
    CardName: r?.CardName ?? "Unknown",
    Image: r?.Document?.image?.[0] ?? "Unknown",
    Values: r?.Document?.hawk_child_attributes?.filter((matches) => matches.option_condition == 'NM')?.map((v) => {
      return {
        Price: Number(v.child_price_retail?.[0]??-1),
        InStock: (v.child_inventory_level?.length > 0 && v.child_inventory_level?.[0] >0),
        Finish: v.option_finish?.[0] ?? "Unknown"
      }
    }) ?? [],
  } as Card));
  // resu.forEach((r) => {
  //   const values = r.Document?.hawk_child_attributes?.filter((matches) => matches.option_condition == 'NM');
  //   if (values?.length > 0) {
  //     values.forEach((v) => {
  //       r.Values = [...r.Values, {
  //         Price: Number(v.child_price_retail?.[0]??-1),
  //         InStock: (v.child_inventory_level?.length > 0 && v.child_inventory_level?.[0] >0),
  //         Foil: v.option_foil[0]
  //       }]
  //     });
  //   }
  // });
  return json(resu);
  // return new Response(String(random));
}


// This handler will respond to PUT, PATCH, DELETE, etc.
/** @type {import('./$types').RequestHandler} */
export async function fallback({ request }) {
	return json([`I caught your ${request.method} request but will do nothing about it!`]);
}
