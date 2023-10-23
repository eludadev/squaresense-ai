'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { LineChartIcon } from 'lucide-react';
import { ChatList } from './chat-list';
import { useChat } from 'ai/react';
import { useToast } from './ui/use-toast';
import { ChatPanel } from './chat-panel';
import Lottie from 'react-lottie';
import loadingAnimationLight from '@/animations/run-analysis-light.json';
import loadingAnimationDark from '@/animations/run-analysis-dark.json';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import useContext from '@/hooks/useContext';

export default function RunAnalysis() {
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [isGenerating, toggleGenerating] = useState(true);

  const { context } = useContext();
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages: [
        {
          content:
            'For each of my age buckets show me a psychographic analysis with personality, interest, hobbies, trends, music, food, drinks, TV shows, fashion, sports that those ages groups like. Also for each category give examples, brands, names, show names, restaurant names, etc.',
          role: 'user',
          id: 'run-analysis',
        },
      ],
      body: {
        id: 'run-analysis',
        context,
      },
      onResponse(response) {
        if (response.status === 401) {
          toast({
            title: 'An error happened!',
            description: response.statusText,
          });
        }
      },
    });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startGenerating() {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toggleGenerating(false);
  }

  useEffect(() => {
    if (open) {
      startGenerating();
    } else {
      toggleGenerating(true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger>
              <Button variant="ghost" className="rounded-full w-8 h-8 p-2">
                <LineChartIcon className="w-4 h-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Run Analysis</p>
          </TooltipContent>
        </Tooltip>
        <TooltipContent>
          <p>Generate Product</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="lg:max-w-screen-xl overflow-y-scroll h-[90vh] max-h-screen">
        <DialogHeader className="h-fit">
          <DialogTitle>Run Analysis</DialogTitle>
          <DialogDescription>
            Unlock insights with psychographic analysis. Understand customer
            behavior and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-full min-h-[78vh]">
          <div className="h-full mt-4 pb-12 overflow-hidden">
            {messages.length && !isGenerating ? (
              <ChatList messages={messages} />
            ) : (
              <div className="absolute inset-0 flex items-center gap-4 flex-col justify-center">
                <Lottie
                  options={{
                    animationData:
                      resolvedTheme === 'dark'
                        ? loadingAnimationLight
                        : loadingAnimationDark,
                    rendererSettings: {
                      preserveAspectRatio: 'xMidYMid slice',
                      className: 'stroke-white',
                    },
                    loop: true,
                    autoplay: true,
                  }}
                  width={100}
                  height={100}
                />
                <p>Running analysis...</p>
              </div>
            )}
          </div>
          {!isGenerating && (
            <ChatPanel
              isLoading={isLoading}
              stop={stop}
              append={append}
              reload={reload}
              messages={messages}
              input={input}
              setInput={setInput}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
