import { type Message } from 'ai';

import { ChatMessage } from '@/components/chat-message';
import { Separator } from './ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ChatList {
  messages: Message[];
}

export function ChatList({ messages }: ChatList) {
  if (!messages.length) {
    return null;
  }

  return (
    <ScrollArea className="relative mx-auto px-4 h-full pb-12">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} />
          {index < messages.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </ScrollArea>
  );
}
