import { type Merchant } from '@/lib/types';
import { useCookies } from 'react-cookie';
import useSWR, { type Fetcher } from 'swr';

const fetcher: Fetcher<Merchant> = (url: string) =>
  fetch(url).then((r) => r.json());

export default function useMerchant() {
  const [accessToken] = useCookies(['square_access_token']);
  const shouldFetch = accessToken !== undefined;

  const { data, error, isLoading } = useSWR<Merchant>(
    () => (shouldFetch ? `/api/merchant` : null),
    fetcher,
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}
