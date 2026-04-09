'use client';
import { EmailAndPassword } from '@/components/Auth/EmailAndPassword';
import { EmailConfirmationPendingCard } from '@/components/Auth/EmailConfirmationPendingCard';
import { RedirectingPleaseWaitCard } from '@/components/Auth/RedirectingPleaseWaitCard';
import {
  signInWithPasswordAction,
} from '@/data/auth/auth';
import { setAuthTokens } from '@/utils/jwt-tokens';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { 
  Globe, 
  TrendingUp, 
  Heart, 
  Check, 
  Info
} from 'lucide-react';
import Link from 'next/link';

export function Login({
  next,
  nextActionType,
}: {
  next?: string;
  nextActionType?: string;
}) {
  const [emailSentSuccessMessage, setEmailSentSuccessMessage] = useState<
    string | null
  >(null);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);
  const hasRedirectedRef = useRef(false);

  const router = useRouter();

  const { execute: executePassword, status: passwordStatus } = useAction(
    signInWithPasswordAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Logging in...');
      },
      onSuccess: ({ data }) => {
        if (hasRedirectedRef.current) return;
        hasRedirectedRef.current = true;

        if (data?.access && data?.refresh) {
          setAuthTokens(data.access, data.refresh);
        }

        toast.success('Logged in!', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setRedirectInProgress(true);
        
        setTimeout(() => {
          const redirectUrl = next ? `/auth/callback?next=${next}` : '/dashboard';
          window.location.href = redirectUrl;
        }, 500);
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Sign in account failed ${String(error)}`;
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  if (emailSentSuccessMessage) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <EmailConfirmationPendingCard
          type={'login'}
          heading={'Confirmation Link Sent'}
          message={emailSentSuccessMessage}
          resetSuccessMessage={setEmailSentSuccessMessage}
        />
      </div>
    );
  }

  if (redirectInProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <RedirectingPleaseWaitCard
          message="Please wait while we redirect you to your dashboard."
          heading="Redirecting to Dashboard"
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Logo - Top Left Corner */}
      <div className="absolute top-8 left-8 z-10 text-2xl font-bold text-white" style={{ fontFamily: "'Oceanwide Pro', sans-serif" }}>
        photon
      </div>

      {/* Left Panel - Marketing Content */}
      <div 
        className="hidden lg:flex lg:w-[35%] text-white pt-8 pb-8 pr-8 pl-0 flex-col justify-between relative h-screen"
        style={{
          background: 'radial-gradient(circle at top right, rgba(64, 76, 184, 1) 0%, rgba(64, 76, 184, 0) 30%, rgba(27, 34, 44, 1) 100%)'
        }}
      >
        <div className="space-y-12 pt-24 pl-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl leading-tight text-left" style={{ fontFamily: 'var(--font-header), serif', fontWeight: 300 }}>
              Investing for those
              <br />
              <span className="text-[#4d74ff]">who take it seriously</span>
            </h1>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-[#4d74ff] flex-shrink-0" />
              <span className="text-sm">Multi-asset investing.</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-[#4d74ff] flex-shrink-0" />
              <span className="text-sm">Industry-leading yields.</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 text-[#4d74ff] flex-shrink-0" />
              <span className="text-sm">Trusted by millions.</span>
            </div>
          </div>

          {/* Investment Options */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              'Stocks',
              'Options Trading',
              'Treasuries',
              'Bonds',
              { text: 'High-Yield Cash Account', badge: '3.6% APY¹' },
              'ETFs',
              'Crypto',
              { text: 'Bond Account', badge: '5.50% yield²' },
            ].map((item, index) => {
              const isObject = typeof item === 'object';
              return (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#4d74ff] flex-shrink-0 mt-0.5" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm">
                      {isObject ? item.text : item}
                    </span>
                    {isObject && item.badge && (
                      <span className="px-1.5 py-0.5 bg-[#4d74ff] rounded text-xs font-medium">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclosures */}
        <div className="space-y-1.5 text-xs text-[var(--pw-greyscale-500)] text-center">
          <div className="flex items-center gap-1.5">
            <Info className="h-1 w-5" />
          </div>
          <p className="leading-snug">
            All investing involves risk, including loss of principle. See disclosures for more information. 
            ¹APY is variable and subject to change. ²This yield is the current average, annualized yield to worst (YTW) across all bonds in the Bond Account, before fees.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[65%] flex items-center justify-center bg-background p-8 h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="-mt-16 text-left">
            <h2 className="text-4xl font-bold text-foreground mb-1">Log in</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>New to Photon?</span>
              <Link 
                href="/sign-up" 
                className="text-[#4d74ff] hover:opacity-80 font-medium"
              >
                Create account &gt;
              </Link>
            </div>
          </div>

                  <EmailAndPassword
                    isLoading={passwordStatus === 'executing'}
                    onSubmit={(data) => {
                      executePassword({
                        email: data.email,
                        password: data.password,
                      });
                    }}
                    view="sign-in"
                  />
        </div>
      </div>
    </div>
  );
}
