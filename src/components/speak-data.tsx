import { SpeakerLoudIcon } from '@radix-ui/react-icons';
import { Button } from './ui/button';
import { useRef, useState } from 'react';
import { LoaderIcon, SquareIcon } from 'lucide-react';
import { Howl } from 'howler';
import useContext from '@/hooks/useContext';

export default function SpeakData({
  prompt,
  message,
  className,
}: {
  prompt?: string;
  message?: string;
  className?: string;
}) {
  const isRunning = useRef(false);
  const [isLoading, toggleLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const sound = useRef<Howl>();

  const { context } = useContext();
  async function generate() {
    toggleLoading(true);
    isRunning.current = true;

    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (isRunning.current) {
      if (prompt !== undefined) {
        // Generate a response, then play it
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analyze`,
          {
            method: 'POST',
            body: JSON.stringify({ context, prompt }),
          },
        );

        const { content } = await res.json();

        const audioRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/speech`,
          {
            method: 'POST',
            body: JSON.stringify({ message: content }),
          },
        );

        const { url: audioUrl } = await audioRes.json();

        sound.current = new Howl({
          src: [`data:audio/mp3;base64,${audioUrl}`],
          format: ['ogg'],
          html5: true,
        });

        sound.current.once('end', () => {
          setIsPlaying(false);
          sound.current = undefined;
        });

        sound.current.play();
      } else if (message !== undefined) {
        const audioRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/speech`,
          {
            method: 'POST',
            body: JSON.stringify({ message }),
          },
        );

        const { url: audioUrl } = await audioRes.json();

        sound.current = new Howl({
          src: [`data:audio/mp3;base64,${audioUrl}`],
          format: ['ogg'],
          html5: true,
        });

        sound.current.once('end', () => {
          setIsPlaying(false);
          sound.current = undefined;
        });

        sound.current.play();
      }

      toggleLoading(false);
      setIsPlaying(true);
    }
  }

  async function stop() {
    isRunning.current = false;
    if (sound.current) {
      sound.current.stop();
      toggleLoading(false);
      setIsPlaying(false);
    }
  }

  return (
    <Button
      onClick={isLoading || isPlaying ? stop : generate}
      variant="ghost"
      size="icon"
      className={className}
    >
      {isLoading ? (
        <LoaderIcon className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <SquareIcon className="w-4 h-4" />
      ) : (
        <SpeakerLoudIcon className="w-4 h-4" />
      )}
    </Button>
  );
}
