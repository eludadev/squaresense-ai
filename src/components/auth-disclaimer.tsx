import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export default function AuthDisclaimer() {
  const t = useTranslations('Auth');

  return (
    <ReactMarkdown
      components={{
        a({ children, href }) {
          return (
            <Link
              href={href ?? '#'}
              className="underline underline-offset-4 hover:text-primary"
            >
              {children}
            </Link>
          );
        },
        p({ children }) {
          return (
            <p className="px-8 text-center text-sm text-muted-foreground">
              {children}
            </p>
          );
        },
      }}
    >
      {t('disclaimer')}
    </ReactMarkdown>
  );
}
