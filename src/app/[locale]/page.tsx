import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AreaChartIcon } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SquareSense AI',
};

export default async function HomePage() {
  const cookieStore = cookies();
  if (!cookieStore.has('square_access_token')) {
    redirect('/auth');
  }

  return (
    <div className="w-screen h-screen grid place-items-center">
      <Link href="/dashboard">
        <Button className="space-x-2" asChild>
          <div>
            <AreaChartIcon />
            <span>Dashboard</span>
          </div>
        </Button>
      </Link>
    </div>
  );
}
