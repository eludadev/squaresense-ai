import { SQUAREUP_LIVE_URL, SQUAREUP_TEST_URL } from '@/lib/constants';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { type Merchant } from '@/lib/types';

interface RawData {
  merchant?: {
    id: string;
    business_name?: string;
    country: string;
    currency?: string;
  }[];
}

export async function GET() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('square_access_token');
  const testModeCookie = cookieStore.get('test_mode');

  if (tokenCookie === undefined) throw new Error();
  const testMode = testModeCookie?.value === 'true';

  const res = await fetch(
    `${testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL}/v2/merchants`,
    {
      headers: {
        'Square-Version': '2023-08-16',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    },
  );

  const rawData = (await res.json()) as RawData;
  const rawDataObjects = rawData.merchant ?? [];

  if (rawDataObjects.length === 0) throw new Error();
  const rawObject = rawDataObjects[0];

  const merchantObject: Merchant = {
    id: rawObject.id,
    country: rawObject.country,
    currency: rawObject.currency,
    name: rawObject.business_name,
  };

  return NextResponse.json(merchantObject);
}
