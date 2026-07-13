'use client';

import { StoreBootstrap } from '@/components/layout/StoreBootstrap';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreBootstrap />
      {children}
    </>
  );
}
