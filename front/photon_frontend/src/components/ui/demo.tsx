'use client';

import { SplineScene } from '@/components/ui/splite';

export function SplineSceneBasic() {
  return (
    <div className="relative h-[500px] w-full md:h-[600px] lg:h-[700px]">
      <SplineScene
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        className="h-full w-full"
      />
    </div>
  );
}
