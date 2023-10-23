import { UseChatHelpers } from 'ai/react';

import { Button } from '@/components/ui/button';
import { ExternalLink } from '@/components/external-link';
import { ArrowRightIcon } from 'lucide-react';

const exampleMessages = [
  {
    heading: 'Most popular item',
    message: `What is my most popular item?`,
  },
  {
    heading: 'Explore data insights',
    message: `Identify trends and patterns in my sales data.`,
  },
  {
    heading: 'Explain business metrics',
    message: 'What is my CLV?',
  },
];

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">Welcome to SquareSense!</h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is a financial AI chatbot app built with{' '}
          <ExternalLink href="https://cloud.google.com/vertex-ai">
            Google Vertex AI
          </ExternalLink>{' '}
          and{' '}
          <ExternalLink href="https://developer.squareup.com/us/en">
            Square API
          </ExternalLink>
          .
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following suggestions:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <ArrowRightIcon className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
