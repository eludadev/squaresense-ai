'use client';

import AuthContext, { AuthState } from '@/context/auth';
import { useContext, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';
import SquareLogo from '@/vectors/square';
import SpinnerIcon from '@/vectors/spinner';
import {
  LIVE_CLIENT_ID,
  LIVE_REDIRECT_URI,
  SANDBOX_CLIENT_ID,
  SANDBOX_REDIRECT_URI,
  SQUAREUP_LIVE_URL,
  SQUAREUP_TEST_URL,
} from '@/lib/constants';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';

export default function AuthButton({ testMode }: { testMode?: boolean }) {
  const t = useTranslations('Auth');
  const { replace } = useRouter();

  const [isAuthenticating, toggleAuthenticating] = useState(false);
  const [keyCookies, setCookie, deleteCookie] = useCookies([
    'square_code',
    'square_access_token',
    'test_mode',
  ]);

  async function fetchAccessToken() {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
      });

      if (res.ok) {
        toggleAuthenticating(false);
        deleteCookie('square_code');
        replace('/');
      }
    } catch {
      // TODO: Handle error
    }
  }

  // Delete cookies on load to prevent infinite redirections
  useEffect(() => {
    if (keyCookies.square_access_token === undefined) {
      deleteCookie('square_code');
      deleteCookie('square_access_token');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (keyCookies.square_code !== undefined) {
      fetchAccessToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyCookies]);

  function openAuthWindow() {
    if (typeof window !== 'undefined') {
      setCookie('test_mode', testMode ? 'true' : 'false');

      // Define the base URL
      const baseUrl = `${
        testMode ? SQUAREUP_TEST_URL : SQUAREUP_LIVE_URL
      }/oauth2/authorize`;

      // Define query parameters as an object
      const queryParams = {
        client_id: testMode ? SANDBOX_CLIENT_ID : LIVE_CLIENT_ID,
        redirect_uri: testMode ? SANDBOX_REDIRECT_URI : LIVE_REDIRECT_URI,
        scope: [
          'ITEMS_READ',
          'ITEMS_WRITE',
          'CUSTOMERS_WRITE',
          'CUSTOMERS_READ',
          'ORDERS_READ',
          'ORDERS_WRITE',
          'MERCHANT_PROFILE_READ',
        ].join(','),
      };

      // Serialize the query parameters into a string
      const queryParamsString = Object.entries(queryParams)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join('&');

      // Construct the final URL with query parameters
      const urlWithParams = `${baseUrl}?${queryParamsString}`;

      // Open the URL in a new popup window
      const popup = window.open(
        urlWithParams,
        '_blank',
        'width=500,height=500',
      );

      // Check if the popup was blocked by a popup blocker
      if (!popup) {
        alert('Popup blocked. Please allow popups for this website.');
      } else {
        toggleAuthenticating(true);
      }
    } else {
      console.error('Cannot authenticate in non-browser environment.');
    }
  }

  return (
    <Button
      onClick={openAuthWindow}
      className="space-x-2"
      disabled={isAuthenticating}
    >
      {isAuthenticating ? (
        <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <SquareLogo className="w-4 h-4" />
      )}
      <span>
        {t(isAuthenticating ? 'pending' : 'action')}
        {testMode ? ' Sandbox' : ''}
      </span>
    </Button>
  );
}
