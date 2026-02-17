import ClaimClient from '../ClaimClient';
import { Suspense } from 'react';

export default function ClaimTokenPage({ params }: { params: { token: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClaimClient initialToken={params.token} />
    </Suspense>
  );
}
