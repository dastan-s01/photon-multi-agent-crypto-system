import { Suspense } from 'react';
import { getCachedLoggedInVerifiedUser } from '@/rsc-data/auth';
import { UpdatePassword } from './UpdatePassword';

async function UpdatePasswordContent() {
  await getCachedLoggedInVerifiedUser();
  return <UpdatePassword />;
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePasswordContent />
    </Suspense>
  );
}
