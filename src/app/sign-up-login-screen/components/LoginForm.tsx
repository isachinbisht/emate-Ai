'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Backend integration point: replace mock auth with Supabase Auth signInWithPassword
const MOCK_CREDENTIALS = {
  email: 'arjun.sharma@ipu.ac.in',
  password: 'StudySprint@2026',
};

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const supabase = createClient();

  const getRedirectUrl = (path = '/auth/callback') => {
    const baseUrl =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028';

    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: { rememberMe: false },
  });

  const handleCopy = (field: 'email' | 'password') => {
    const value = field === 'email' ? MOCK_CREDENTIALS.email : MOCK_CREDENTIALS.password;
    navigator.clipboard.writeText(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const autofill = () => {
    setValue('email', MOCK_CREDENTIALS.email);
    setValue('password', MOCK_CREDENTIALS.password);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('root', {
        message: error.message || 'Unable to sign in right now. Please try again.',
      });
      setIsLoading(false);
      return;
    }

    toast.success('Signed in successfully!');
    window.location.assign('/');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display text-text-primary">Welcome back</h2>
        <p className="text-sm text-text-secondary mt-1.5">
          Sign in to continue your study sessions
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={async () => {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: getRedirectUrl(),
            },
          });

          if (error) {
            toast.error(error.message);
            return;
          }

          if (data?.url) {
            window.location.assign(data.url);
          }
        }}
        className="btn-ghost w-full flex items-center justify-center gap-2.5 py-2.5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Root error */}
        {errors.root && (
          <div
            className="px-4 py-3 rounded-lg text-xs text-danger"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {errors.root.message}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-sm font-medium text-text-primary">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="you@university.ac.in"
            className="pill-input w-full px-4 py-2.5 text-sm"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-text-primary">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-primary hover:text-primary-hover transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pill-input w-full px-4 py-2.5 pr-12 text-sm"
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4 h-4 rounded accent-primary"
            {...register('rememberMe')}
          />
          <label htmlFor="remember-me" className="text-sm text-text-secondary cursor-pointer">
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-primary">Demo Account</p>
          <button
            onClick={autofill}
            className="text-xs px-2.5 py-1 rounded-md font-medium text-primary transition-all duration-150 hover:bg-primary/10"
          >
            Autofill
          </button>
        </div>
        {(['email', 'password'] as const).map((field) => (
          <div key={`cred-${field}`} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-text-muted capitalize">{field}</p>
              <p className="text-xs font-mono text-text-secondary truncate">
                {field === 'email' ? MOCK_CREDENTIALS.email : MOCK_CREDENTIALS.password}
              </p>
            </div>
            <button
              onClick={() => handleCopy(field)}
              className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary/10 transition-all duration-150 shrink-0"
              aria-label={`Copy ${field}`}
            >
              {copied === field ? <Check size={13} className="text-success" /> : <Copy size={13} />}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-text-secondary">
        No account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-primary hover:text-primary-hover font-semibold transition-colors"
        >
          Sign up free
        </button>
      </p>
    </div>
  );
}
