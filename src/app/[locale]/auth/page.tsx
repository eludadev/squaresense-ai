import AuthButton from '@/components/auth-button';
import AuthDisclaimer from '@/components/auth-disclaimer';
import TestButton from '@/components/test-button';
import SquareLogo from '@/vectors/square';

import { Metadata } from 'next';
import { useTranslations } from 'next-intl';

export const metadata: Metadata = {
  title: 'Authentication | SquareSense AI',
};

export default function AuthenticationPage() {
  const t = useTranslations();

  return (
    <>
      <div className="container relative h-screen lg:h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg> */}
            <SquareLogo className="w-5 h-5 mr-2 stroke-primary-foreground" />
            {t('Index.title')}
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;{t('Index.quote.message')}&rdquo;
              </p>
              <footer className="text-sm">{t('Index.quote.author')}</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {t('Auth.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('Auth.subtitle')}
              </p>
            </div>
            <div className="space-y-1 flex flex-col justify-stretch">
              <AuthButton />
              <AuthButton testMode />
              <TestButton />
            </div>
            <AuthDisclaimer />
          </div>
        </div>
      </div>
    </>
  );
}
