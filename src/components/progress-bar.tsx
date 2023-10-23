'use client';

import { AppProgressBar } from 'next-nprogress-bar';

export default function ProgressBar() {
  return (
    <AppProgressBar
      height="4px"
      color="#0ea5e9"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
