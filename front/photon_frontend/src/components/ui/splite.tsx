'use client';

import { Suspense, lazy } from 'react';

import { Spinner } from '@/components/ui/spinner';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Spinner className="h-6 w-6 text-primary" />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
