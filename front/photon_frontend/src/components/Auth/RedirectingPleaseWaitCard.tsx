'use client';

interface RedirectingPleaseWaitCardProps {
  message: string;
  heading: string;
}

export function RedirectingPleaseWaitCard({
  message,
  heading,
}: RedirectingPleaseWaitCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center space-y-6 max-w-md text-center">
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--pw-greyscale-300)] rounded-full"></div>
          <div className="w-16 h-16 border-9 border-black border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-foreground">
          {heading}
        </h2>

        {/* Message */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
