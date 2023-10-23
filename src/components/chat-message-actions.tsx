'use client';

import { type Message } from 'ai';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { CheckIcon, CopyIcon } from 'lucide-react';
import SpeakData from './speak-data';

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: Message;
}

export function ChatMessageActions({
  message,
  className,
  ...props
}: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard(message.content);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100',
        className,
      )}
      {...props}
    >
      <SpeakData message={message.content} />
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <CheckIcon /> : <CopyIcon />}
        <span className="sr-only">Copy message</span>
      </Button>
    </div>
  );
}
