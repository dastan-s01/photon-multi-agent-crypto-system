import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { ComponentProps } from 'react';

export const EmailAndPassword = ({
  onSubmit,
  view,
  isLoading,
}: {
  onSubmit: (data: { email: string; password: string }) => void;
  view: 'sign-in' | 'sign-up';
  isLoading: boolean;
} & ComponentProps<typeof Button>) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          email,
          password,
        });
      }}
      data-testid="password-form"
      className="space-y-6"
    >
      <div className="space-y-2">
        <Input
          id={`${view}-email`}
          name="email"
          type="email"
          disabled={isLoading}
          value={email}
          data-strategy="email-password"
          placeholder="Email"
          onChange={(event) => setEmail(event.target.value)}
          autoComplete={'email'}
          required
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Input
            id={`${view}-password`}
            name="password"
            type={showPassword ? 'text' : 'password'}
            disabled={isLoading}
            value={password}
            placeholder="Password"
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={
              view === 'sign-in' ? 'current-password' : 'new-password'
            }
            required
            className="h-12 text-base pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {view === 'sign-in' && (
        <div>
          <Link
            href="/forgot-password"
            className="text-sm text-[#4d74ff] hover:opacity-80 font-medium"
          >
            Forgot your password?
          </Link>
        </div>
      )}

      <Button 
        disabled={isLoading || !email || !password} 
        type="submit" 
        className="w-full h-10 text-sm bg-[var(--pw-greyscale-300)] text-[var(--pw-greyscale-1000)] hover:bg-[var(--pw-greyscale-400)] disabled:opacity-10 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <Spinner className="h-4 w-4 mr-2" />
            <span>Loading...</span>
          </>
        ) : (
          <span>{view === 'sign-in' ? 'Log in' : 'Sign up'}</span>
        )}
      </Button>
    </form>
  );
};
