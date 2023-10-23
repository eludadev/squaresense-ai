'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PersonIcon } from '@radix-ui/react-icons';
import {
  CalendarCheck2Icon,
  CoinsIcon,
  CreditCardIcon,
  StoreIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const pathName = usePathname();

  return (
    <div className="sticky top-0 h-fit pb-12 col-start-1 px-2 col-end-3 flex-col justify-start items-stretch pt-4 row-start-1 row-end-1">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Observe
          </h2>
          <div className="gap-1 flex flex-col">
            <Link href="/dashboard/catalog">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  pathName === '/dashboard/catalog' && 'bg-primary-foreground',
                )}
                asChild
              >
                <div>
                  <StoreIcon className="mr-2 h-4 w-4" />
                  <span>Catalog</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  pathName === '/dashboard/orders' && 'bg-primary-foreground',
                )}
                asChild
              >
                <div>
                  <CoinsIcon className="mr-2 h-4 w-4" />
                  <span>Orders</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/customers">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  pathName === '/dashboard/customers' &&
                    'bg-primary-foreground',
                )}
                asChild
              >
                <div>
                  <PersonIcon className="mr-2 h-4 w-4" />
                  <span>Customers</span>
                </div>
              </Button>
            </Link>
            <Button
              variant="ghost"
              className={cn('w-full justify-start')}
              asChild
            >
              <div>
                <CreditCardIcon className="mr-2 h-4 w-4" />
                <span>Subscriptions</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start')}
              asChild
            >
              <div>
                <CalendarCheck2Icon className="mr-2 h-4 w-4" />
                <span>Appointments</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
