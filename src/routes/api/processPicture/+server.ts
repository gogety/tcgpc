import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { Buffer } from 'buffer';  // Import Buffer from 'buffer'
import { Readable } from 'stream';  // Import Readable from 'stream'

// Replace these with your actual endpoint and API key
const endpoint = 'https://tcgpcscanner.cognitiveservices.azure.com';
const apiKey = '83c5e51a98c048558cf9b639ff9dbbf0';

const credential = new AzureKeyCredential(apiKey);
const client = new DocumentAnalysisClient(
  endpoint,
  credential
);

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { image } = await request.json();

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Create a readable stream from the buffer
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // Send the stream to the Azure API
    const poller = await client.beginAnalyzeDocument("mtg", stream);
    const response = await poller.pollUntilDone();

    if (!response) {
      return json({ error: 'Azure API error: No response received' }, { status: 500 });
    }
    
    console.log(JSON.stringify(response?.documents?.[0]?.fields))
    return json(response, { status: 200 });
  } catch (error) {
    console.error('Error processing image:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};