'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { CornerDownLeftIcon, Loader2Icon, PackagePlusIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useToast } from './ui/use-toast';
import { useEnterSubmit } from '@/hooks/useEnterSubmit';
import Textarea from 'react-textarea-autosize';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import useContext from '@/hooks/useContext';
import { Catalog } from '@/lib/types';
import { uniqueId } from 'lodash';

export default function GenerateProduct() {
  const { toast } = useToast();

  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isOpen, toggleOpen] = useState(false);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const [input, setInput] = useState('');
  const [isLoading, toggleLoading] = useState(false);

  const { context } = useContext();

  useEffect(() => {
    if (inputRef.current && isOpen) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  async function onSubmit(text: string) {
    toggleLoading(true);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({ context, prompt: input }),
    });

    const { imageUrl, name, description } = await res.json();

    setName(name);
    setImageUrl(imageUrl);
    setDescription(description);

    toggleLoading(false);
  }

  async function saveProduct() {
    const product: Catalog = {
      color: '000000',
      description,
      title: name,
      id: uniqueId(),
      variations: [
        {
          id: uniqueId(),
        },
      ],
      money: {
        amount: 0,
        currency: 'USD',
      },
      price: '0 USD',
      category: 'AI Generated',
    };

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog`, {
      method: 'POST',
      body: JSON.stringify({ catalog: [product] }),
    });

    toast({
      title: 'Added new product.',
      description: `"${name}" has been added to your catalog.`,
    });

    discard();
  }

  function discard() {
    setName('');
    setDescription('');
    toggleOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" className="rounded-full w-8 h-8 p-2">
              <PackagePlusIcon className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Generate Product</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Product</DialogTitle>
          <DialogDescription>
            Use AI chat for streamlined product creation, optimizing SEO, and
            leveraging existing products for context.
          </DialogDescription>
        </DialogHeader>
        <div
          className={cn(
            'flex gap-4 py-4 relative',
            isLoading && 'after:absolute after:inset-0 after:backdrop-blur-sm',
          )}
        >
          {isLoading && (
            <div className="absolute inset-0 grid place-items-center z-10">
              <Loader2Icon className="w-4 h-4 animate-spin" />
            </div>
          )}
          <div className="w-48 h-48 rounded-xl bg-primary-foreground shrink-0">
            {imageUrl.length > 0 ? (
              <Image
                width={192}
                height={192}
                src={imageUrl}
                alt={name}
                className="object-cover rounded-xl bg-primary-foreground"
              />
            ) : (
              <Skeleton className="w-full h-full rounded-xl" />
            )}
          </div>
          <div className="space-y-4 grow">
            <div className="space-y-2 items-start justify-start flex flex-col">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                disabled={isLoading}
                onChange={(event) => setName(event.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2 items-start justify-start flex flex-col grow">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                disabled={isLoading}
                onChange={(event) => setDescription(event.target.value)}
                className="col-span-3 grow"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 border-t bg-background px-4 shadow-lg py-2">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!input?.trim()) {
                return;
              }
              setInput('');
              await onSubmit(input);
            }}
            ref={formRef}
          >
            <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background pr-8">
              <Textarea
                ref={inputRef}
                tabIndex={0}
                onKeyDown={onKeyDown}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your product..."
                spellCheck={false}
                className="min-h-[60px] disabled:text-muted w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none"
              />
              <div className="absolute right-0 top-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || input === ''}
                    >
                      <CornerDownLeftIcon />
                      <span className="sr-only">Generate product</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Generate product</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </form>
        </div>
        <DialogFooter>
          <Button type="button" variant="destructive" onClick={discard}>
            Discard
          </Button>
          <Button type="submit" onClick={saveProduct}>
            Save Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
