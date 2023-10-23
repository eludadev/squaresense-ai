'use client';

import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslations } from 'next-intl';

export default function AuthenticationDonePopup() {
  const t = useTranslations('Auth');
  const [_, setAccessToken] = useCookies(['square_code']);

  useEffect(() => {
    // Function to get query parameter value from the URL
    const getQueryParamValue = (param: string) => {
      const queryParams = new URLSearchParams(window.location.search);
      return queryParams.get(param);
    };

    // Read 'access_token' query parameter from the current URL
    const tokenFromQueryParam = getQueryParamValue('code');

    if (tokenFromQueryParam !== null) {
      // Save the 'access_token' to local storage
      setAccessToken('square_code', tokenFromQueryParam, {
        path: '/',
      });
    } else {
      console.error('Failed to fetch Square OAuth access code!');
    }

    if (typeof window !== 'undefined') {
      window.close();
    }
  }, [setAccessToken]);

  return (
    <div className="grid place-items-center h-screen">
      <p className="font-bold">{t('done')}</p>
    </div>
  );
}
