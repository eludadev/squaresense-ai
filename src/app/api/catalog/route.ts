import { SQUAREUP_LIVE_URL, SQUAREUP_TEST_URL } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { type Catalog, type CatalogData } from '@/lib/types';

interface RawData {
  cursor?: string;
  objects?: {
    id: string;
    type: 'ITEM' | 'ITEM_VARIATION' | 'CATEGORY';
    item_data?: {
      name: string;
      category_id?: string;
      label_color: string;
      description_plaintext: string;
      variations: {
        item_variation_data: {
          price_money: {
            amount: number;
            currency: string;
          };
        };
      }[];
    };
    item_variation_data?: {
      item_id: string;
    };
    category_data?: {
      name: string;
    };
  }[];
}

export async function GET() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('square_access_token');
  const testModeCookie = cookieStore.get('test_mode');

  if (tokenCookie === undefined) throw new Error();
  const testMode = testModeCookie?.value === 'true';

  // Define the base URL
  const baseUrl = `${
    testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL
  }/v2/catalog/list`;

  // Define query parameters as an object
  const queryParams: {
    types: string;
    cursor?: string;
  } = {
    types: ['ITEM', 'ITEM_VARIATION', 'CATEGORY'].join(','),
    // Add the cursor parameter here
    cursor: undefined, // Set cursor to undefined initially
  };

  let hasMoreData = true; // Flag to track if there's more data

  const parsedData: CatalogData = {
    items: [],
  };

  // Loop until there's no more data
  while (hasMoreData) {
    // Serialize the query parameters into a string
    const queryParamsString = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined) // Filter out undefined values
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join('&');

    // Construct the final URL with query parameters
    const urlWithParams = `${baseUrl}?${queryParamsString}`;

    const res = await fetch(urlWithParams, {
      headers: {
        'Square-Version': '2023-08-16',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

    const rawData = (await res.json()) as RawData;
    const cursor = rawData.cursor;
    const rawDataObjects = rawData.objects ?? [];

    const categories: Record<string, string> = {};

    rawDataObjects.forEach((rawObject) => {
      if (
        rawObject.type === 'CATEGORY' &&
        rawObject.category_data !== undefined
      ) {
        categories[rawObject.id] = rawObject.category_data.name;
      }
    });

    const variations: {
      variation_id: string;
      item_id: string;
    }[] = [];

    rawDataObjects.forEach((rawObject) => {
      if (rawObject.type === 'ITEM' && rawObject.item_data !== undefined) {
        let price: string | undefined;
        let money:
          | {
              amount: number;
              currency: string;
            }
          | undefined;
        if (rawObject.item_data.variations?.length > 0) {
          const { amount, currency } =
            rawObject.item_data.variations[0].item_variation_data.price_money;

          money = { amount: amount / 100, currency };

          // Convert cents to dollars, and format to 2 decimal points
          price = `${currency} ${(amount / 100).toFixed(2)}`;
        }

        let category: string | undefined;
        if (
          rawObject.item_data.category_id !== undefined &&
          categories[rawObject.item_data.category_id] !== undefined
        ) {
          category = categories[rawObject.item_data.category_id];
        }

        const newItem: Catalog = {
          price,
          id: rawObject.id,
          title: rawObject.item_data.name,
          color: `#${rawObject.item_data.label_color}`,
          description: rawObject.item_data.description_plaintext,
          variations: [],
          money,
          category,
        };

        parsedData.items.push(newItem);
      } else if (
        rawObject.type === 'ITEM_VARIATION' &&
        rawObject.item_variation_data !== undefined
      ) {
        variations.push({
          item_id: rawObject.item_variation_data.item_id,
          variation_id: rawObject.id,
        });
      }
    });

    for (const variation of variations) {
      const item = parsedData.items.find((x) => x.id === variation.item_id);
      item?.variations.push({
        id: variation.variation_id,
      });
    }

    if (cursor) {
      // Set the cursor for the next iteration
      queryParams.cursor = cursor;
    } else {
      // If cursor is unset, it signifies the final page, exit the loop
      hasMoreData = false;
    }
  }

  return NextResponse.json(parsedData);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  if (body['ids'] === undefined || !Array.isArray(body['ids'])) {
    throw new Error();
  }

  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('square_access_token');
  const testModeCookie = cookieStore.get('test_mode');

  if (tokenCookie === undefined) throw new Error();
  const testMode = testModeCookie?.value === 'true';

  // Define the base URL
  const baseUrl = `${
    testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL
  }/v2/catalog/batch-delete`;

  await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Square-Version': '2023-08-16',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenCookie.value}`,
    },
    body: JSON.stringify({
      object_ids: body['ids'],
    }),
  });

  return NextResponse.json({ ids: body['ids'] }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body['catalog'] === undefined) {
    throw new Error();
  }

  const catalog = body['catalog'] as Catalog[];

  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('square_access_token');
  const testModeCookie = cookieStore.get('test_mode');

  if (tokenCookie === undefined) throw new Error();
  const testMode = testModeCookie?.value === 'true';

  // Define the base URL
  const baseUrl = `${
    testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL
  }/v2/catalog/batch-upsert`;

  // Create categories
  const categoryIds: Map<string, string> = new Map();

  const categories = catalog
    .map((product) => product.category)
    .filter((x) => x !== undefined);
  const filteredCategories = categories.filter(
    (item, index) => categories.indexOf(item) === index,
  ) as string[];

  const categoryRes = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Square-Version': '2023-08-16',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenCookie.value}`,
    },
    body: JSON.stringify({
      idempotency_key: uuidv4(),
      batches: [
        {
          objects: filteredCategories.map((category) => ({
            type: 'CATEGORY',
            id: `#${uuidv4()}`,
            category_data: {
              name: category,
            },
          })),
        },
      ],
    }),
  });

  const categoriesData = await categoryRes.json();
  if (categoriesData['errors'] !== undefined) throw new Error();

  const categoryObjects = categoriesData.objects;
  for (const item of categoryObjects) {
    categoryIds.set(item.category_data.name, item.id);
  }

  // Create products
  await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Square-Version': '2023-08-16',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenCookie.value}`,
    },
    body: JSON.stringify({
      idempotency_key: uuidv4(),
      batches: [
        {
          objects: catalog.map((product) => {
            return {
              type: 'ITEM',
              id: product.id,
              item_data: {
                name: product.title,
                description: product.description,
                label_color: product.color.slice(1),
                category_id:
                  product.category === undefined
                    ? undefined
                    : categoryIds.get(product.category),
                variations: product.variations.map((variation) => ({
                  type: 'ITEM_VARIATION',
                  id: variation.id,
                  item_variation_data: {
                    name: 'Base',
                    price_money: {
                      amount: (product.money?.amount ?? 0) * 100,
                      currency: 'USD',
                    },
                    sku: 'base',
                    pricing_type: 'FIXED_PRICING',
                    item_id: product.id,
                  },
                })),
              },
            };
          }),
        },
      ],
    }),
  });

  return NextResponse.json({ catalog }, { status: 200 });
}
