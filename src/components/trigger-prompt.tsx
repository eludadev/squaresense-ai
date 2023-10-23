'use client';

import { LightbulbIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { ChatPanel } from './chat-panel';
import { ChatList } from './chat-list';
import { EmptyScreen } from './empty-screen';
import { useToast } from './ui/use-toast';
import { useChat } from 'ai/react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import useContext from '@/hooks/useContext';

export default function TriggerPrompt({
  label,
  prompt,
  className,
}: {
  label: string;
  prompt: string;
  className?: string;
}) {
  const { toast } = useToast();

  const { context } = useContext();
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      body: {
        id: label,
        context,
      },
      initialMessages: [
        {
          role: 'user',
          content: prompt,
          id: label,
        },
      ],
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

  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="outline"
          className={cn(
            'flex h-fit relative before:pointer-events-none before:absolute before:inset-x-0 before:h-0.5 before:bottom-0 before:bg-gradient-to-r before:from-transparent before:to-transparent before:via-foreground/50 py-2 before:animate-pulse hover:before:animate-none hover:before:via-foreground/80 before:transition-colors',
            className,
          )}
        >
          <LightbulbIcon className="w-4 h-4 mr-3 mt-1 self-start shrink-0" />
          <span className="grow text-start">Prompt: {label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={'lg:max-w-screen-xl overflow-y-scroll h-[90vh] max-h-screen'}
      >
        <div className="h-full mt-4 pb-12 overflow-hidden">
          {messages.length ? (
            <ChatList messages={messages} />
          ) : (
            <EmptyScreen setInput={setInput} />
          )}
        </div>
        <ChatPanel
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
