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
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  BarChart3Icon,
  CoinsIcon,
  CornerDownLeftIcon,
  LineChartIcon,
  Loader2Icon,
  PieChartIcon,
  StoreIcon,
  UserIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from './ui/use-toast';
import { useEnterSubmit } from '@/hooks/useEnterSubmit';
import Textarea from 'react-textarea-autosize';
import { cn } from '@/lib/utils';
import useContext from '@/hooks/useContext';
import NewChartButton from './new-chart-button';
import { Toggle } from '@/components/ui/toggle';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function NewChart({
  onCreate,
}: {
  onCreate?: (description: string, type: 'bar' | 'line' | 'pie') => void;
}) {
  const { toast } = useToast();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isOpen, toggleOpen] = useState(false);

  const [input, setInput] = useState('');
  const [type, setType] = useState<'bar' | 'pie' | 'line'>('bar');

  useEffect(() => {
    if (inputRef.current && isOpen) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  async function onSubmit() {
    onCreate?.(input, type);
    toast({
      title: 'Generating new chart...',
      description: `A new chart is being generated. Please wait.`,
    });
    discard();
  }

  function discard() {
    toggleOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleOpen}>
      <DialogTrigger asChild>
        <NewChartButton onClick={() => toggleOpen(true)} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Chart</DialogTitle>
          <DialogDescription>
            Automatically generate interactive financial store data charts from
            descriptions using Google Vertex AI.
          </DialogDescription>
        </DialogHeader>
        <div className={cn('space-y-8 py-4 relative')}>
          <div className="flex flex-col items-start mx-1 gap-2">
            <p>Datasets to Use</p>
            <div className="flex items-center justify-stretch gap-1">
              <Toggle
                variant="outline"
                size="lg"
                className="flex flex-col items-center gap-2 p-2 h-16"
                pressed
              >
                <StoreIcon className="w-4 h-4 shrink-0" />
                <span>Catalog</span>
              </Toggle>
              <Toggle
                variant="outline"
                size="lg"
                className="flex flex-col items-center gap-2 p-2 h-16"
              >
                <CoinsIcon className="w-4 h-4 shrink-0" />
                <span>Orders</span>
              </Toggle>
              <Toggle
                variant="outline"
                size="lg"
                className="flex flex-col items-center gap-2 p-2 h-16"
              >
                <UserIcon className="w-4 h-4 shrink-0" />
                <span>Customers</span>
              </Toggle>
            </div>
          </div>
          <div className="flex flex-col items-start mx-1 gap-2">
            <p>Type of Chart</p>
            <RadioGroup
              value={type}
              onValueChange={(value) =>
                setType(value as 'bar' | 'pie' | 'line')
              }
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="bar" id="bar" className="peer sr-only" />
                <Label
                  htmlFor="bar"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <BarChart3Icon className="mb-3 h-6 w-6" />
                  Bar
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="line"
                  id="line"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="line"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <LineChartIcon className="mb-3 h-6 w-6" />
                  Line
                </Label>
              </div>
              <div>
                <RadioGroupItem value="pie" id="pie" className="peer sr-only" />
                <Label
                  htmlFor="pie"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <PieChartIcon className="mb-3 h-6 w-6" />
                  Pie
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-4 grow"></div>
        </div>
        <div className="space-y-4 border-t bg-background px-4 shadow-lg py-2">
          <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background pr-8">
            <Textarea
              ref={inputRef}
              tabIndex={0}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your chart..."
              spellCheck={false}
              className="min-h-[60px] disabled:text-muted w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="destructive" onClick={discard}>
            Discard
          </Button>
          <Button type="submit" onClick={onSubmit}>
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
