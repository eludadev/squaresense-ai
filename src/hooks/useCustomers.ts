import { type CustomersData } from '@/lib/types';
import { useCookies } from 'react-cookie';
import useSWR, { type Fetcher } from 'swr';

const fetcher: Fetcher<CustomersData> = (url: string) =>
  fetch(url).then((r) => r.json());

export default function useCustomers() {
  const [accessToken] = useCookies(['square_access_token']);
  const shouldFetch = accessToken !== undefined;

  const { data, error, isLoading } = useSWR<CustomersData>(
    () => (shouldFetch ? `/api/customers` : null),
    fetcher,
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}
