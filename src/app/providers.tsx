'use client';

import { SessionProvider } from 'next-auth/react';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}
