'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import MagicButton from './magic-button';
import { type ComponentProps } from 'react';
import { type Message, useChat } from 'ai/react';
import { EmptyScreen } from './empty-screen';
import { ChatList } from './chat-list';
import { cn } from '@/lib/utils';
import { ChatPanel } from './chat-panel';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { DatabaseIcon, LineChartIcon, StoreIcon } from 'lucide-react';
import GenerateProduct from './generate-product';
import { useToast } from '@/components/ui/use-toast';
import { SpeakerLoudIcon, SpeakerModerateIcon } from '@radix-ui/react-icons';
import SpeakData from './speak-data';
import RunAnalysis from './run-analysis';
import GenerateMockData from './generate-mock-data';
import useContext from '@/hooks/useContext';

export interface ChatProps extends ComponentProps<'div'> {
  initialMessages?: Message[];
  id?: string;
}

export default function AIChat({ id, initialMessages, className }: ChatProps) {
  const { toast } = useToast();

  const { context } = useContext();
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages,
      id,
      body: {
        id,
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

  return (
    <Dialog>
      <div className="py-12 grid place-items-center fixed bottom-0 w-[350px] left-1/2 transform -translate-x-1/2">
        <div className="flex justify-center gap-2 items-center before:backdrop-blur-sm before:-z-10 before:bg-primary-foreground/20 before:shadow- before:border before:border-muted dark:before:border-muted/50 before:h-8 before:rounded-full before:absolute before:w-full before:pointer-events-none">
          <GenerateProduct />
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <SpeakData
                  prompt="Summarize my store data. Give me insights I should know. Keep it brief."
                  className="rounded-full w-8 h-8 p-2"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Speak My Data</p>
            </TooltipContent>
          </Tooltip>
          <DialogTrigger className="mx-2" asChild>
            <MagicButton dotsAmount={40} onClick={() => {}}>
              AI Chat
            </MagicButton>
          </DialogTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <GenerateMockData />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate Mock Data</p>
            </TooltipContent>
          </Tooltip>
          <RunAnalysis />
        </div>
      </div>
      <DialogContent
        className={'lg:max-w-screen-xl overflow-y-scroll h-[90vh] max-h-screen'}
      >
        <div className={cn('h-full mt-4 pb-12 overflow-hidden', className)}>
          {messages.length ? (
            <ChatList messages={messages} />
          ) : (
            <EmptyScreen setInput={setInput} />
          )}
        </div>
        <ChatPanel
          id={id}
          isLoading={isLoading}
          stop={stop}
          append={append}
          reload={reload}
          messages={messages}
          input={input}
          setInput={setInput}
        />
      </DialogContent>
    </Dialog>
  );
}
