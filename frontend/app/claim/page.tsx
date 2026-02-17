import ClaimClient from './ClaimClient';
import { Suspense } from 'react';

export default function ClaimPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClaimClient initialToken={searchParams.token} />
    </Suspense>
  );
}
