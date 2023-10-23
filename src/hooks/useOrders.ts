import { type OrdersData } from '@/lib/types';
import { useCookies } from 'react-cookie';
import useSWR, { type Fetcher } from 'swr';

const fetcher: Fetcher<OrdersData> = (url: string) =>
  fetch(url).then((r) => r.json());

export default function useOrders() {
  const [accessToken] = useCookies(['square_access_token']);
  const shouldFetch = accessToken !== undefined;

  const { data, error, isLoading } = useSWR<OrdersData>(
    () => (shouldFetch ? `/api/orders` : null),
    fetcher,
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}
