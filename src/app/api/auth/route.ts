import {
  LIVE_CLIENT_ID,
  LIVE_REDIRECT_URI,
  SANDBOX_CLIENT_ID,
  SANDBOX_REDIRECT_URI,
  SQUAREUP_LIVE_URL,
  SQUAREUP_TEST_URL,
} from '@/lib/constants';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  const codeCookie = cookieStore.get('square_code');
  const testModeCookie = cookieStore.get('test_mode');

  if (codeCookie === undefined) throw new Error();
  const testMode = testModeCookie?.value === 'true';

  const res = await fetch(
    `${testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL}/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Square-Version': '2023-08-16',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: codeCookie.value,
        client_id: testMode ? SANDBOX_CLIENT_ID : LIVE_CLIENT_ID,
        client_secret: testMode
          ? process.env.SQUARE_SANDBOX_SECRET
          : process.env.SQUARE_LIVE_SECRET,
        grant_type: 'authorization_code',
        scopes: [
          'ITEMS_READ',
          'ITEMS_WRITE',
          'CUSTOMERS_WRITE',
          'CUSTOMERS_READ',
          'ORDERS_READ',
          'ORDERS_WRITE',
          'MERCHANT_PROFILE_READ',
        ],
        redirect_uri: testMode ? SANDBOX_REDIRECT_URI : LIVE_REDIRECT_URI,
      }),
    },
  );
  const {
    access_token,
    expires_at,
  }: {
    access_token: string;
    expires_at: string;
  } = await res.json();

  if (access_token !== undefined && expires_at !== undefined) {
    cookieStore.set('square_access_token', access_token, {
      expires: new Date(expires_at),
      secure: true,
    });
  }

  return NextResponse.json(
    {},
    {
      status: 200,
    },
  );
}
