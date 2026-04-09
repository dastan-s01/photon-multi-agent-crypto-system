'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FloatingLabelInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: boolean;
  showPasswordToggle?: boolean;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, error, showPasswordToggle, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type;

    const isShrunk = isFocused || hasValue || (props.value && String(props.value).length > 0);

    return (
      <div className="relative w-full">
        <div
          className={cn(
            'relative flex items-center',
            'bg-white border border-[#d4d9df] rounded-lg',
            'cursor-text transition-all duration-200',
            'h-11 px-3',
            error && 'border-[#ff0066]',
            'hover:border-[#a8b4bf]',
            isFocused && 'border-[#0038ff]',
            className
          )}
          onClick={() => inputRef.current?.focus()}
        >
          <label
            className={cn(
              'absolute left-3 pointer-events-none transition-all duration-200',
              'text-[#516880] text-sm',
              'origin-top-left',
              isShrunk
                ? 'top-0 translate-y-[-10px] scale-[0.88] bg-white px-1 font-semibold text-xs'
                : 'top-1/2 -translate-y-1/2 scale-100 font-normal text-sm',
              error && 'text-[#ff0066]'
            )}
            data-focused={isFocused}
            data-shrink={isShrunk}
          >
            {label}
          </label>
          <input
            ref={inputRef}
            type={inputType}
            className={cn(
              'w-full bg-transparent border-0 outline-none',
              'text-black text-sm font-semibold',
              'placeholder:text-[#a8b4bf] placeholder:font-normal placeholder:opacity-40',
              'caret-[#0038ff]',
              'disabled:bg-white disabled:text-[#d4d9df] disabled:cursor-not-allowed',
              error && 'text-[#ff0066]'
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPassword(!showPassword);
              }}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'w-8 h-8 rounded-full flex items-center justify-center',
                'bg-transparent text-[#516880]',
                'hover:bg-[#f6f8f9] transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-[#0038ff] focus:ring-offset-2'
              )}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingLabelInput };





