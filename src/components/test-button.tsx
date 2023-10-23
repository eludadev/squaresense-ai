'use client';

import { Button } from './ui/button';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import { TestTube2Icon } from 'lucide-react';

export default function TestButton() {
  const { replace } = useRouter();

  const [_, setCookie] = useCookies(['square_access_token', 'test_mode']);

  async function startTestMode() {
    setCookie(
      'square_access_token',
      'EAAAEMYlAuwhQgdK6CRe7MrnRvBrl6tZsbayxOchI4vMrP8nSFGmIBRFloa7Itgy',
    );

    setCookie('test_mode', 'true');

    replace('/dashboard/catalog');
  }

  return (
    <Button onClick={startTestMode} className="space-x-2" variant="outline">
      <TestTube2Icon className="w-4 h-4" />
      <span>Test Mode</span>
    </Button>
  );
}
