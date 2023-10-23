import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppMenu } from '@/components/app-menu';
import { AppSidebar } from '@/components/app-sidebar';
import type { ReactNode } from 'react';
import ProgressBar from '@/components/progress-bar';
import AIChat from '@/components/ai-chat';

export const metadata: Metadata = {
  title: 'SquareSense AI',
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = cookies();
  if (!cookieStore.has('square_access_token')) {
    redirect('/auth');
  }

  return (
    <div>
      <AppMenu />
      <ProgressBar />

      <div className="grid mx-2 min-h-screen mb-8 gap-4 grid-cols-12 grid-rows-1">
        <div className="pt-6 col-start-3 col-end-13 row-start-1 row-end-1">
          {children}
        </div>
        <AppSidebar />
        <AIChat />
      </div>
    </div>
  );
}
