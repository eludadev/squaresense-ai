import { Catalog, Customer, Order } from '@/lib/types';
import { NextResponse } from 'next/server';

export const maxDuration = 300;

export async function POST(req: Request) {
  const json = await req.json();
  const {
    prompt,
    context,
  }: {
    prompt: string;
    context?: {
      orders: Order[];
      catalog: Catalog[];
      customers: Customer[];
    };
  } = json;

  if (context === undefined) throw new Error();

  let contextString = '';

  contextString +=
    'List of store products with fields {id, variationIds, title, description, price, category}:\n';
  for (const {
    id,
    title,
    description,
    price,
    category,
    variations,
  } of context.catalog) {
    contextString += `${id} | ${variations.map(
      (x) => x.id,
    )} | ${title} | ${description} | ${price} | ${category}\n`;
  }

  contextString +=
    'List of store customers with fields {id, givenName, familyName, birthday, email, address, locality, country, postalCode}:\n';
  for (const {
    id,
    givenName,
    familyName,
    birthday,
    email,
    address,
    locality,
    country,
    postalCode,
  } of context.customers) {
    contextString += `${id} | ${givenName} | ${familyName} | ${birthday} | ${email} | ${address} | ${locality} | ${country} | ${postalCode}\n`;
  }

  contextString +=
    'List of store orders with fields {createdAt, customerId, itemId, itemName, itemQuantity, price, source}:\n';
  for (const {
    createdAt,
    customerId,
    itemId,
    itemName,
    itemQuantity,
    price,
    source,
  } of context.orders) {
    contextString += `${createdAt} | ${customerId} | ${itemId} | ${itemName} | ${itemQuantity} | ${price} | ${source}\n`;
  }

  const [image, content] = await Promise.all([
    new Promise<string>(async (resolve) => {
     // Specify the scopes
const SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];

// Load the credentials from the service account file
const credentials = require('/content/sascha-playground-doit-bacb8b46a9f4.json');
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: SCOPES,
});

const authedClient = await auth.getClient();

// Set your project ID, text prompt, and image count
const PROJECT_ID = 'sascha-playground-doit';
const TEXT_PROMPT = 'A beautiful black cat';
const IMAGE_COUNT = 4; // any integer from 1 to 8

// Prepare the request body
const data = {
  instances: [
    {
      prompt: TEXT_PROMPT,
    },
  ],
  parameters: {
    sampleCount: IMAGE_COUNT,
  },
};

// Send the request
const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagegeneration:predict`;
const response = await axios.post(url, data, {
  headers: {
    Authorization: `Bearer ${authedClient.credentials.access_token}`,
  },
});

// Parse the response
const response_data = response.data;
console.log(response_data);

const predictions = response_data.predictions || [];

// Save the generated images
for (let i = 0; i < predictions.length; i++) {
  const imgData = predictions[i].bytesBase64Encoded;
  const imgBuffer = Buffer.from(imgData, 'base64');

  // You may need to adjust the file path and format based on your requirements
  fs.writeFileSync(`output_${i + 1}.png`, imgBuffer);
}

      resolve(imageUrl as string);
    }),
    new Promise<string>(async (resolve) => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${process.env.PALM_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: {
              text: `
You are a data analyst that provides insights and summaries on the given data. Keep your responses brief.
Here is my data:\n\n${contextString}
Use the past data as context to do the following. Generate a new store product with the prompt: ${prompt}
New Product in JSON format { name, description }: 
    `,
            },
            temperature: 0.7,
            top_k: 40,
            top_p: 0.95,
            candidate_count: 1,
            max_output_tokens: 1024,
            stop_sequences: [],
            safety_settings: [
              { category: 'HARM_CATEGORY_DEROGATORY', threshold: 1 },
              { category: 'HARM_CATEGORY_TOXICITY', threshold: 1 },
              { category: 'HARM_CATEGORY_VIOLENCE', threshold: 2 },
              { category: 'HARM_CATEGORY_SEXUAL', threshold: 2 },
              { category: 'HARM_CATEGORY_MEDICAL', threshold: 2 },
              { category: 'HARM_CATEGORY_DANGEROUS', threshold: 2 },
            ],
          }),
        },
      );

      const data = (await res.json()) as {
        candidates: {
          output: string;
        }[];
      };

      if (data.candidates.length === 0) throw new Error();

      resolve(data.candidates[0].output);
    }),
  ]);

  const { name, description } = JSON.parse(content);

  return NextResponse.json(
    { imageUrl: image, name, description },
    { status: 200 },
  );
}
