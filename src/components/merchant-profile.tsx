'use client';

import useMerchant from '@/hooks/useMerchant';
import { Skeleton } from './ui/skeleton';
import ReactCountryFlag from 'react-country-flag';
import { Button } from './ui/button';
import { StoreIcon } from 'lucide-react';

export default function MerchantProfile() {
  const { data, isLoading } = useMerchant();

  if (isLoading || data === undefined)
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-2 w-[150px]" />
          <Skeleton className="h-2 w-[50px]" />
        </div>
      </div>
    );
  else
    return (
      <div className="flex justify-between items-center space-x-2">
        <div className="w-8 h-8 bg-primary grid place-items-center rounded-full">
          <StoreIcon className="w-4 h-4 stroke-primary-foreground dark:stroke-secondary-foreground" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold">{data.name}</h4>
          <div className="flex items-center gap-2">
            <ReactCountryFlag countryCode={data.country} />
            <span className="text-xs text-muted-foreground">
              {data.currency}
            </span>
          </div>
        </div>
      </div>
    );
}
