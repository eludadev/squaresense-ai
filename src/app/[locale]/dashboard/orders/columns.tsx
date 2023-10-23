'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type Customer, type Order } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import moment from 'moment';

export function generateColumns(customerData?: Customer[]): ColumnDef<Order>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: 'Created At',
      accessorFn: (row) => moment(row.createdAt).format('MMMM Do YYYY'),
    },
    {
      header: 'Updated At',
      accessorFn: (row) => moment(row.updatedAt).fromNow(),
    },
    {
      header: 'Customer Name',
      accessorFn: (row) => {
        if (customerData !== undefined && row.customerId !== undefined) {
          const customer = customerData.find((x) => x.id === row.customerId);
          return customer?.givenName;
        } else {
          return undefined;
        }
      },
    },
    {
      accessorKey: 'itemName',
      header: 'Item Name',
    },
    {
      accessorKey: 'price',
      header: 'Price',
    },
    {
      accessorKey: 'itemQuantity',
      header: 'Quantity',
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(order.id)}
              >
                Copy order ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
