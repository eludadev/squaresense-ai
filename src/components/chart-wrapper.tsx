import { type ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import SpinnerIcon from '@/vectors/spinner';
import SpeakData from './speak-data';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { SparklesIcon, TrashIcon } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';

export enum ChartSize {
  NORMAL,
  MEDIUM,
  SMALL,
}

export default function ChartWrapper({
  isLoading,
  children,
  title,
  description,
  size = ChartSize.NORMAL,
  prompt,
  onDelete,
  onReload,
  isGenerated,
}: {
  isLoading: boolean;
  children: ReactNode;
  title: string;
  description: string;
  size?: ChartSize;
  prompt: string;
  onReload?: () => void;
  onDelete?: () => void;
  isGenerated?: boolean;
}) {
  return (
    <Card className={cn('relative w-full h-full overflow-hidden')}>
      <CardHeader className="pointer-events-none">
        {isGenerated && (
          <div className="px-4 py-1 text-sm font-semibold flex items-center gap-1 dark:bg-indigo-700 bg-indigo-100 border border-indigo-600 dark:border-none shadow mb-2 rounded-full w-fit">
            <SparklesIcon className="w-4 h-4 mr-2" />
            <span>AI Generated</span>
          </div>
        )}
        <div className="flex gap-4">
          <div className="grow space-y-2">
            <CardTitle className="select-none">{title}</CardTitle>
            <CardDescription className="select-none">
              {description}
            </CardDescription>
          </div>
          {onDelete !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="pointer-events-auto">
                  <Button
                    onClick={onDelete}
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-8 h-8 p-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Chart</p>
              </TooltipContent>
            </Tooltip>
          )}
          {onReload !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="pointer-events-auto">
                  <Button
                    onClick={onReload}
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-8 h-8 p-2"
                  >
                    <ReloadIcon className="w-4 h-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Regenerate Chart</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="pointer-events-auto">
                <SpeakData
                  className="rounded-full w-8 h-8 p-2"
                  prompt={prompt}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Speak Chart</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="grid place-items-center">
        {isLoading ? (
          <SpinnerIcon className="w-4 h-4 mx-auto my-4 animate-spin" />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
