'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { type Catalog } from '@/lib/types';
import { type ColumnDef } from '@tanstack/react-table';
import AIEditorMenu from '@/components/ai-editor';

export function generateColumns(catalog?: Catalog[]): ColumnDef<Catalog>[] {
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
      accessorKey: 'price',
      header: 'Price',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <AIEditorMenu row={row.original} data={catalog ?? {}} />
      ),
    },
  ];
}
