'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  university: string;
  course: string;
  terms: boolean;
}

const UNIVERSITIES = [
  { id: 'ipu', name: 'Guru Gobind Singh Indraprastha University (IPU)' },
  { id: 'du', name: 'Delhi University (DU)' },
  { id: 'vtu', name: 'Visvesvaraya Technological University (VTU)' },
  { id: 'anna', name: 'Anna University' },
  { id: 'mu', name: 'Mumbai University' },
  { id: 'other', name: 'Other University' },
];

const COURSES = [
  { id: 'bca', name: 'BCA — Bachelor of Computer Applications' },
  { id: 'btech-cs', name: 'B.Tech — Computer Science & Engineering' },
  { id: 'btech-it', name: 'B.Tech — Information Technology' },
  { id: 'bsc-cs', name: 'B.Sc. — Computer Science' },
  { id: 'mca', name: 'MCA — Master of Computer Applications' },
];

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    formState: { errors },
  } = useForm<SignupFormValues>();

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          university: data.university,
          course: data.course,
        },
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (authData.user && !authData.session) {
      toast.success('Check your email to confirm your account!');
    } else {
      toast.success('Account created! Redirecting to your dashboard...');
      window.location.assign('/');
    }
    setIsLoading(false);
  };

  const inputClass =
    'w-full px-4 py-2.5 text-sm rounded-lg bg-input border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-150';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display text-text-primary">Create your account</h2>
        <p className="text-sm text-text-secondary mt-1.5">
          Join thousands of students studying smarter
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={async () => {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: getRedirectUrl(),
            },
          });
          if (error) toast.error(error.message);
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
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="signup-name" className="block text-sm font-medium text-text-primary">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            placeholder="Arjun Sharma"
            className={inputClass}
            {...register('name', { required: 'Full name is required' })}
          />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="signup-email" className="block text-sm font-medium text-text-primary">
            University email
          </label>
          <input
            id="signup-email"
            type="email"
            placeholder="you@university.ac.in"
            className={inputClass}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="block text-sm font-medium text-text-primary">
            Password
          </label>
          <p className="text-xs text-text-muted">Min 8 characters, include a number and symbol</p>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className={`${inputClass} pr-12`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
                  message: 'Include at least one number and one symbol',
                },
              })}
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
          {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
        </div>

        {/* University selector */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-university"
            className="block text-sm font-medium text-text-primary"
          >
            University
          </label>
          <select
            id="signup-university"
            className={`${inputClass} appearance-none cursor-pointer`}
            {...register('university', { required: 'Select your university' })}
          >
            <option value="" disabled>
              Select your university...
            </option>
            {UNIVERSITIES.map((u) => (
              <option key={`univ-${u.id}`} value={u.id} className="bg-card">
                {u.name}
              </option>
            ))}
          </select>
          {errors.university && <p className="text-xs text-danger">{errors.university.message}</p>}
        </div>

        {/* Course selector */}
        <div className="space-y-1.5">
          <label htmlFor="signup-course" className="block text-sm font-medium text-text-primary">
            Program / Course
          </label>
          <select
            id="signup-course"
            className={`${inputClass} appearance-none cursor-pointer`}
            {...register('course', { required: 'Select your course' })}
          >
            <option value="" disabled>
              Select your program...
            </option>
            {COURSES.map((c) => (
              <option key={`course-${c.id}`} value={c.id} className="bg-card">
                {c.name}
              </option>
            ))}
          </select>
          {errors.course && <p className="text-xs text-danger">{errors.course.message}</p>}
        </div>

        {/* OpenRouter key hint */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}
        >
          <Key size={14} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-primary">
              You&apos;ll need an OpenRouter API key
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              e-Mate uses your own key to power AI features — free to get at openrouter.ai. Set it
              up in Settings after signup.
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            id="signup-terms"
            type="checkbox"
            className="w-4 h-4 rounded accent-primary mt-0.5"
            {...register('terms', { required: 'Accept the terms to continue' })}
          />
          <label
            htmlFor="signup-terms"
            className="text-xs text-text-secondary cursor-pointer leading-relaxed"
          >
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.terms && <p className="text-xs text-danger -mt-2">{errors.terms.message}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-primary hover:text-primary-hover font-semibold transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
