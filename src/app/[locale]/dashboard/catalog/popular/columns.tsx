'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { type Order, type Catalog, type Customer } from '@/lib/types';
import { type ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateMostCommonAgeGroup, isNumeric } from '@/lib/utils';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function generateColumns(
  orderData?: Order[],
  customerData?: Customer[],
): ColumnDef<Catalog>[] {
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
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        return (
          <div className="font-medium flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm shrink-0"
              style={{ backgroundColor: row.original.color }}
            ></div>
            <span>{row.original.title}</span>
          </div>
        );
      },
    },
    {
      header: 'Most Popular w/ Ages',
      accessorFn: (row) => {
        if (orderData !== undefined && customerData !== undefined) {
          const customerIds = orderData
            .filter(
              (order) =>
                order.itemId !== undefined &&
                row.variations
                  .map((variation) => variation.id)
                  .includes(order.itemId),
            )
            .map((order) => order.customerId);

          const customers = customerData.filter((customer) =>
            customerIds.includes(customer.id),
          );

          const birthdays = customers
            .map<string | undefined>((customer) => customer.birthday)
            .filter((birthday) => birthday !== undefined)
            .map((birthday) => new Date(birthday as string)) as Date[];

          return calculateMostCommonAgeGroup(birthdays);
        } else {
          return undefined;
        }
      },
    },
    {
      header: 'Total Number Sold',
      accessorFn: (row) => {
        if (orderData !== undefined) {
          const quantities = orderData
            .filter((order) => {
              return (
                order.itemId !== undefined &&
                row.variations
                  .map((variation) => variation.id)
                  .includes(order.itemId)
              );
            })
            .map((order) =>
              order.itemQuantity !== undefined && isNumeric(order.itemQuantity)
                ? parseInt(order.itemQuantity)
                : 0,
            );
          return quantities.reduce((a, b) => a + b, 0);
        } else {
          return undefined;
        }
      },
    },
    {
      id: 'total-sales',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Total Sales
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      sortingFn: ({ original: rowA }, { original: rowB }) => {
        if (orderData !== undefined) {
          const totalQuantityAccessor = (row: Catalog) => {
            const price = row.money?.amount ?? 0;

            const quantities = orderData
              .filter((order) => {
                return (
                  order.itemId !== undefined &&
                  row.variations
                    .map((variation) => variation.id)
                    .includes(order.itemId)
                );
              })
              .map((order) =>
                order.itemQuantity !== undefined &&
                isNumeric(order.itemQuantity)
                  ? parseInt(order.itemQuantity)
                  : 0,
              );

            const totalQuantity = quantities.reduce((a, b) => a + b, 0) * price;

            return totalQuantity;
          };

          return totalQuantityAccessor(rowA) > totalQuantityAccessor(rowB)
            ? 1
            : totalQuantityAccessor(rowA) < totalQuantityAccessor(rowB)
            ? -1
            : 0;
        } else {
          return 0;
        }
      },
      sortDescFirst: true,
      enableSorting: true,
      accessorFn: (row) => {
        if (orderData !== undefined) {
          const price = row.money?.amount ?? 0;
          const currency = row.money?.currency ?? '';

          const quantities = orderData
            .filter((order) => {
              return (
                order.itemId !== undefined &&
                row.variations
                  .map((variation) => variation.id)
                  .includes(order.itemId)
              );
            })
            .map((order) =>
              order.itemQuantity !== undefined && isNumeric(order.itemQuantity)
                ? parseInt(order.itemQuantity)
                : 0,
            );

          const totalQuantity = quantities.reduce((a, b) => a + b, 0);

          return `${currency} ${(totalQuantity * price).toLocaleString()}`;
        } else {
          return undefined;
        }
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: function Cell({ row }) {
        const product = row.original;
        const variationIds = product.variations.map((x) => x.id);
        const variationId = variationIds.length > 0 ? variationIds[0] : null;

        const [open, setOpen] = useState(false);

        let customers: Customer[] | undefined;
        if (orderData !== undefined && customerData !== undefined) {
          const customerIds = orderData
            .filter(
              (order) =>
                order.itemId !== undefined &&
                product.variations
                  .map((variation) => variation.id)
                  .includes(order.itemId),
            )
            .map((order) => order.customerId);

          customers = customerData.filter((customer) =>
            customerIds.includes(customer.id),
          );
        }

        return (
          <div>
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
                  onClick={() => navigator.clipboard.writeText(product.id)}
                >
                  Copy product ID
                </DropdownMenuItem>
                {variationId !== null && (
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(variationId)}
                  >
                    Copy catalog ID
                  </DropdownMenuItem>
                )}
                {customers !== undefined && (
                  <DropdownMenuItem onClick={() => setOpen(true)}>
                    View customers
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {customers !== undefined && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Customers</SheetTitle>
                    <SheetDescription>
                      These are the customers that have purchased{' '}
                      <span className="font-bold">{`"${product.title}"`}</span>
                    </SheetDescription>
                  </SheetHeader>
                  <Table className="my-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Name</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">
                            {`${customer.givenName} ${customer.familyName}`}
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </SheetContent>
              </Sheet>
            )}
          </div>
        );
      },
    },
  ];
}
