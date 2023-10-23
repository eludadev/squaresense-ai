'use client';

import {
  ArrowTopLeftIcon,
  CheckIcon,
  MixIcon,
  SizeIcon,
} from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCommandState } from '@/third-party/cmdk';
import { forwardRef, useEffect, useState } from 'react';
import {
  AlignLeftIcon,
  ArrowLeft,
  ArrowRightToLine,
  Copy,
  Flame,
  SparklesIcon,
} from 'lucide-react';
import CurvedArrowBottomLeft from '@/vectors/curved-arrow-bottom-left';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Input } from './ui/input';
import { Message, useChat } from 'ai/react';
import ReactJson from 'react-json-view';
import { jsonrepair } from 'jsonrepair';

const CustomPrompt = forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem>
>(({ ...props }, ref) => {
  const isEmpty = useCommandState((state) => state.filtered.count === 0);
  if (!isEmpty) return null;
  return <CommandItem forceMount={true} {...props} />;
});

CustomPrompt.displayName = CommandItem.displayName;

export default function AIEditorMenu({ row, data }: { row?: any; data: any }) {
  const t = useTranslations('AIEditor');

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [executable, setExecutable] = useState('');

  const { messages, append, reload, stop, input, isLoading, setInput } =
    useChat({
      id: row.id,
      api: '/api/enhance',
      body: {
        id: row.id,
        context: JSON.stringify(data),
      },
    });

  const message: Message | undefined = messages[messages.length - 1];
  const [messageData, setMessageData] = useState<object>();

  useEffect(() => {
    try {
      setMessageData(JSON.parse(jsonrepair(message.content)));
    } catch {}
  }, [message]);

  async function executePrompt(prompt: string) {
    stop();
    append({
      id: row.id,
      content: `JSON Data: ${JSON.stringify(row)}\nPrompt: ${prompt}`,
      role: 'user',
    });

    setExecutable(prompt);
    setIsEditing(true);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsEditing(false);
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
      } else if (e.key === 'r' && !(e.ctrlKey || e.metaKey)) {
        // reload();
      }
    };
    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <DropdownMenu
        open={open}
        onOpenChange={(open) => {
          if (!open) {
            setExecutable('');
            setIsEditing(false);
          }

          setOpen(open);
        }}
        modal={false}
      >
        <DropdownMenuTrigger asChild className="mx-2">
          <Button variant="ghost" size="sm">
            <SparklesIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[500px]" sticky="partial">
          {!isEditing && (
            <Command>
              <div className="ml-3 mt-2 flex items-center gap-1 text-primary">
                <CurvedArrowBottomLeft className="-rotate-90 w-5 h-5" />
                <p className="text-sm mb-1">{t('hint')}</p>
              </div>
              <CommandInput
                placeholder={t('placeholder')}
                value={input}
                autoFocus={true}
                onValueChange={setInput}
              />
              <CommandList>
                <CustomPrompt
                  forceMount={true}
                  className="my-1"
                  onSelect={(value) => executePrompt(value)}
                >
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  <span>{input}</span>
                </CustomPrompt>
                <CommandGroup heading={t('suggestions.title')}>
                  <CommandItem onSelect={(value) => executePrompt(value)}>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    <span>{t('suggestions.items.fix-grammar')}</span>
                  </CommandItem>
                  <CommandItem onSelect={(value) => executePrompt(value)}>
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    <span>{t('suggestions.items.improve-writing')}</span>
                  </CommandItem>
                  <CommandItem onSelect={(value) => executePrompt(value)}>
                    <Flame className="mr-2 h-4 w-4" />
                    <span>{t('suggestions.items.punchier')}</span>
                  </CommandItem>
                  <CommandItem onSelect={(value) => executePrompt(value)}>
                    <SizeIcon className="mr-2 h-4 w-4" />
                    <span>{t('suggestions.items.condense')}</span>
                  </CommandItem>
                  <CommandItem onSelect={(value) => executePrompt(value)}>
                    <MixIcon className="mr-2 h-4 w-4" />
                    <span>{t('suggestions.items.mix')}</span>
                  </CommandItem>
                  <CommandItem onSelect={(value) => executePrompt(value)}>
                    <AlignLeftIcon className="mr-2 h-4 w-4" />
                    <span>{t('suggestions.items.improve')}</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          )}

          {isEditing && (
            <>
              <header className="items-center flex gap-2 p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => {
                        setIsEditing(false);
                      }}
                    >
                      <ArrowLeft className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex items-baseline gap-4">
                      <p>Back</p>
                      <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <span className="text-muted-foreground capitalize text-sm">
                  {executable}
                </span>
              </header>
              <main className="mt-1 mx-2 my-2">
                <div className="mb-2">
                  {message !== undefined &&
                    message.role === 'assistant' &&
                    messageData !== undefined && (
                      <ReactJson src={messageData} theme={'apathy'} />
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={isLoading}
                    variant="default"
                    className="rounded-full flex gap-2 items-center px-4 py-1.5 h-auto font-bold text-secondary dark:text-secondary-foreground tracking-wide"
                  >
                    <span>Replace</span>
                    <CommandShortcut className="flex items-center gap-1 text-secondary dark:text-secondary-foreground">
                      <span>ctrl</span>
                      <ArrowRightToLine className="w-3.5 h-3.5" />
                    </CommandShortcut>
                  </Button>
                  <Button
                    disabled={isLoading}
                    variant="secondary"
                    className="rounded-full flex gap-2 items-center px-4 py-1.5 h-auto font-bold text-secondary-foreground tracking-wide"
                  >
                    <span>Insert</span>
                    <CommandShortcut className="flex items-center gap-1">
                      <span>shift</span>
                      <ArrowRightToLine className="w-3.5 h-3.5" />
                    </CommandShortcut>
                  </Button>
                  <Button
                    disabled={isLoading}
                    variant="secondary"
                    onClick={() => reload()}
                    className="rounded-full flex gap-2 items-baseline py-1.5 px-4 h-auto font-bold text-secondary-foreground tracking-wide"
                  >
                    <span>Retry</span>
                    <CommandShortcut>R</CommandShortcut>
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        disabled={isLoading}
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                      >
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    executePrompt(input);
                  }}
                >
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Refine your content"
                    className="mt-6 flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </form>
                <div className="ml-3 mt-2 flex items-center gap-1 text-primary">
                  <ArrowTopLeftIcon />
                  <p className="text-sm mt-1">
                    You can make further commands to refine your content
                  </p>
                </div>
              </main>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
