import { SQUAREUP_LIVE_URL, SQUAREUP_TEST_URL } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { type Customer, type CustomersData } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface RawData {
  customers?: {
    id: string;
    given_name: string;
    family_name: string;
    email_address: string;
    created_at: string;
    birthday?: string;
    address?: {
      address_line_1?: string;
      locality?: string;
      postal_code?: string;
      country?: string;
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
  const res = await fetch(
    `${testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL}/v2/customers`,
    {
      headers: {
        'Square-Version': '2023-08-16',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    },
  );

  const rawData = (await res.json()) as RawData;
  const rawDataObjects = rawData.customers ?? [];

  const parsedData: CustomersData = {
    customers: rawDataObjects.map((rawObject) => {
      return {
        id: rawObject.id,
        address: rawObject.address?.address_line_1,
        birthday:
          rawObject.birthday === undefined ? undefined : rawObject.birthday,
        country: rawObject.address?.country,
        createdAt: rawObject.created_at,
        email: rawObject.email_address,
        familyName: rawObject.family_name,
        givenName: rawObject.given_name,
        locality: rawObject.address?.locality,
        postalCode: rawObject.address?.postal_code,
      };
    }),
  };

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

  const promises = body['ids'].map((id: string) => {
    const baseUrl = `${
      testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL
    }/v2/customers/${id}`;

    return fetch(baseUrl, {
      method: 'DELETE',
      headers: {
        'Square-Version': '2023-08-16',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });
  });

  await Promise.all(promises);
  return NextResponse.json({ ids: body['ids'] }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body['customers'] === undefined) {
    throw new Error();
  }

  const customers = body['customers'] as Customer[];

  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('square_access_token');
  const testModeCookie = cookieStore.get('test_mode');

  if (tokenCookie === undefined) throw new Error();
  const testMode = testModeCookie?.value === 'true';

  const promises = customers.map((customer) =>
    fetch(`${testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL}/v2/customers`, {
      method: 'POST',
      headers: {
        'Square-Version': '2023-08-16',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCookie.value}`,
      },
      body: JSON.stringify({
        idempotency_key: uuidv4(),
        given_name: customer.givenName,
        family_name: customer.familyName,
        email_address: customer.email,
        address: {
          address_line_1: customer.address,
          locality: customer.locality,
          postal_code: customer.postalCode,
          country: customer.country,
        },
        birthday: customer.birthday,
      }),
    }),
  );

  await Promise.all(promises);
  return NextResponse.json({ customers }, { status: 200 });
}
