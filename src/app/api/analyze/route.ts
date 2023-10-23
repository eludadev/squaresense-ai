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

${contextString}

${prompt}
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

  return NextResponse.json(
    { content: data.candidates[0].output },
    { status: 200 },
  );
}
