import { Button } from './ui/button';
import { useState } from 'react';
import { DatabaseIcon, LoaderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import {
  generateRandomCustomerData,
  generateRandomOrderItemData,
  generateRandomProductData,
} from '@/lib/random';
import { useSWRConfig } from 'swr';
import { type CatalogData, type CustomersData } from '@/lib/types';

export default function GenerateMockData({
  className,
}: {
  className?: string;
}) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const [isLoading, toggleLoading] = useState(false);

  async function generate() {
    toggleLoading(true);

    const catalog = generateRandomProductData(12);
    const customers = generateRandomCustomerData(8);

    await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog`, {
        method: 'POST',
        body: JSON.stringify({ catalog }),
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        method: 'POST',
        body: JSON.stringify({ customers }),
      }),
    ]);

    // Wait for data to sync in Square's backend
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const [updatedCatalogRes, updatedCustomersRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog`, {
        method: 'GET',
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        method: 'GET',
      }),
    ]);

    const updatedCatalog = (await updatedCatalogRes.json()) as CatalogData;
    const updatedCustomers =
      (await updatedCustomersRes.json()) as CustomersData;

    const orders = generateRandomOrderItemData(
      updatedCatalog.items,
      updatedCustomers.customers,
      12,
    );

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
      method: 'POST',
      body: JSON.stringify({ orders }),
    });

    toggleLoading(false);
    mutate(() => true, undefined, { revalidate: false });

    mutate('/api/catalog');
    mutate('/api/customers');
    mutate('/api/orders');
    mutate('/api/merchant');

    toast({
      title: 'Generated mock data.',
      description: 'Mock data has been added successfully.',
    });
  }

  return (
    <Button
      disabled={isLoading}
      onClick={isLoading ? () => {} : generate}
      variant="ghost"
      className={cn('rounded-full w-8 h-8 p-2', className)}
    >
      {isLoading ? (
        <LoaderIcon className="w-4 h-4 animate-spin" />
      ) : (
        <DatabaseIcon className="w-4 h-4" />
      )}
    </Button>
  );
}
