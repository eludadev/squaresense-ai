import { Message, StreamingTextResponse } from 'ai';
import { Catalog, Customer, Order } from '@/lib/types';
import { createDelayedReadableStream } from '../enhance/route';

export const maxDuration = 300;

export async function POST(req: Request) {
  const json = await req.json();
  const {
    messages,
    context,
  }: {
    messages: Message[];
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
  } of context.catalog.slice(0, 15)) {
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
  } of context.customers.slice(0, 15)) {
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
  } of context.orders.slice(0, 15)) {
    contextString += `${createdAt} | ${customerId} | ${itemId} | ${itemName} | ${itemQuantity} | ${price} | ${source}\n`;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${process.env.PALM_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          context: `
Want assistance provided by qualified individuals enabled with experience on understanding charts using technical analysis tools while interpreting macroeconomic environment prevailing across world consequently assisting customers acquire long term advantages requires clear verdicts therefore seeking same through informed predictions written down precisely! First statement contains following content- “Can you tell us what future stock market looks like based upon current conditions ?".
My Store Data: \n${contextString}
Respond by acting on my store data.
`,
          examples: [],
          messages: [...messages.map((x) => ({ content: x.content }))],
        },
        temperature: 0.25,
        top_k: 40,
        top_p: 0.95,
        candidate_count: 1,
      }),
    },
  );

  const data = (await res.json()) as {
    candidates: {
      content: string;
    }[];
  };

  if (data.candidates.length === 0) throw new Error();

  const dataStream = createDelayedReadableStream(
    data.candidates[0].content,
    10,
  );

  return new StreamingTextResponse(dataStream);
}
