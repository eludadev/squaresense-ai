import { type CatalogData } from '@/lib/types';
import { useCookies } from 'react-cookie';
import useSWR, { type Fetcher } from 'swr';

const fetcher: Fetcher<CatalogData> = (url: string) =>
  fetch(url).then((r) => r.json());

export default function useCatalog() {
  const [accessToken] = useCookies(['square_access_token']);
  const shouldFetch = accessToken !== undefined;

  const { data, error, isLoading } = useSWR<CatalogData>(
    () => (shouldFetch ? `/api/catalog` : null),
    fetcher,
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}
