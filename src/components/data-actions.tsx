'use client';

import { LoaderIcon, RefreshCwIcon, TrashIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useSWRConfig } from 'swr';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from './ui/use-toast';

export default function DataActions({
  urls,
  path,
  isLoading,
  allowDelete,
  selectedIds,
}: {
  path?: string;
  urls?: string[];
  isLoading?: boolean;
  allowDelete?: boolean;
  selectedIds?: string[];
}) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const [isDeleting, toggleDeleting] = useState(false);

  function refresh() {
    mutate(() => true, undefined, { revalidate: false });

    if (urls !== undefined) {
      urls.forEach((url) => mutate(url));
    }
    mutate('/api/merchant');
  }

  const canDelete = allowDelete && path !== undefined;

  async function deleteData() {
    if (selectedIds !== null && selectedIds !== undefined) {
      toggleDeleting(true);
      const countToDelete = selectedIds.length;

      const res = await fetch(`http://localhost:3000/${path}`, {
        method: 'DELETE',
        body: JSON.stringify({
          ids: selectedIds,
        }),
      });

      toggleDeleting(false);

      if (res.ok) {
        toast({
          title: 'Deletion successful',
          description: `Successfully deleted ${countToDelete} item${
            countToDelete !== 1 ? 's' : ''
          }.`,
        });

        refresh();
      }
    }
  }

  return (
    <div className="items-center gap-2 flex">
      <Button
        variant="outline"
        size="icon"
        onClick={deleteData}
        disabled={!canDelete || isDeleting}
      >
        {!isDeleting ? (
          <TrashIcon className="w-4 h-4" />
        ) : (
          <LoaderIcon className="w-4 h-4 animate-spin" />
        )}
      </Button>
      <Button variant="outline" disabled={isLoading === true} onClick={refresh}>
        <RefreshCwIcon
          className={cn('w-4 h-4 mr-2', isLoading === true && 'animate-spin')}
        />
        <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
      </Button>
    </div>
  );
}
