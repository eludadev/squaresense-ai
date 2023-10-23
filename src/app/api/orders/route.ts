import { SQUAREUP_LIVE_URL, SQUAREUP_TEST_URL } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { type Order, type OrdersData } from '@/lib/types';

interface RawData {
  orders?: {
    id: string;
    location_id: string;
    customer_id?: string;
    source?: {
      name?: string;
    };
    line_items?: {
      name?: string;
      quantity: string;
      variation_name?: string;
      catalog_object_id?: string;
    }[];
    total_money?: {
      amount: number;
      currency: string;
    };
    updated_at: string;
    created_at: string;
  }[];
}

interface RawLocationData {
  locations?: {
    id: string;
  }[];
}

async function fetchLocations(accessToken: string, testMode: boolean) {
  const res = await fetch(
    `${testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL}/v2/locations`,
    {
      headers: {
        'Square-Version': '2023-08-16',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const rawData = (await res.json()) as RawLocationData;
  const rawDataObjects = rawData.locations ?? [];

  return rawDataObjects;
}

export async function GET() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('square_access_token');
  const testModeCookie = cookieStore.get('test_mode');

  if (tokenCookie === undefined) throw new Error();
  const testMode = testModeCookie?.value === 'true';

  // Fetch store locations
  const locations = await fetchLocations(tokenCookie.value, testMode);

  // Make sure at least one location
  if (locations.length === 0) throw new Error();

  const res = await fetch(
    `${testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL}/v2/orders/search`,
    {
      method: 'POST',
      headers: {
        'Square-Version': '2023-08-16',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCookie.value}`,
      },
      body: JSON.stringify({
        location_ids: locations.slice(0, 10).map((location) => location.id),
        /* `return_entries`
         * A Boolean that controls the format of the search results.
         * If true, SearchOrders returns OrderEntry objects.
         * If false, SearchOrders returns complete order objects.
         */
        return_entries: false,
      }),
    },
  );

  const rawData = (await res.json()) as RawData;
  const rawDataObjects = rawData.orders ?? [];

  const parsedData: OrdersData = {
    orders: rawDataObjects.map((rawObject) => {
      let price: string | undefined;
      let money:
        | {
            amount: number;
            currency: string;
          }
        | undefined;
      if (rawObject.total_money !== undefined) {
        const { amount, currency } = rawObject.total_money;

        money = { amount: amount / 100, currency };

        // Convert cents to dollars, and format to 2 decimal points
        price = `${currency} ${(amount / 100).toFixed(2)}`;
      }

      return {
        price,
        id: rawObject.id,
        itemId:
          rawObject.line_items !== undefined && rawObject.line_items.length > 0
            ? rawObject.line_items[0].catalog_object_id
            : undefined,
        createdAt: rawObject.created_at,
        updatedAt: rawObject.updated_at,
        customerId: rawObject.customer_id,
        itemName:
          rawObject.line_items !== undefined && rawObject.line_items.length > 0
            ? rawObject.line_items[0].name
            : undefined,
        itemQuantity:
          rawObject.line_items !== undefined && rawObject.line_items.length > 0
            ? rawObject.line_items[0].quantity
            : undefined,
        source: rawObject.source?.name,
        money,
      };
    }),
  };

  return NextResponse.json(parsedData);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body['orders'] === undefined) {
    throw new Error();
  }

  const orders = body['orders'] as Order[];

  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('square_access_token');
  const testModeCookie = cookieStore.get('test_mode');

  if (tokenCookie === undefined) throw new Error();
  const testMode = testModeCookie?.value === 'true';

  // Fetch store locations
  const locations = await fetchLocations(tokenCookie.value, testMode);

  // Make sure at least one location
  if (locations.length === 0) throw new Error();
  const mainLocation = locations[0].id;

  const promises = orders.map((order) =>
    fetch(`${testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL}/v2/orders`, {
      method: 'POST',
      headers: {
        'Square-Version': '2023-08-16',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCookie.value}`,
      },
      body: JSON.stringify({
        order: {
          location_id: mainLocation,
          source: {
            name: order.source,
          },
          customer_id: order.customerId,
          line_items: [
            {
              quantity: order.itemQuantity,
              catalog_object_id: order.itemId,
              base_price_money: {
                amount: (order.money?.amount ?? 0) * 100,
                currency: order.money?.currency,
              },
            },
          ],
        },
      }),
    }),
  );

  await Promise.all(promises);
  return NextResponse.json({ orders }, { status: 200 });
}
