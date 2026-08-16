'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  X,
  ArrowLeft,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { clearGuestModeEnabled, setGuestModeEnabled } from '@/lib/guest-mode';
import { applyTheme } from '@/lib/theme';

import { useRouter } from 'next/navigation';

export default function AuthScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'password' | 'confirm'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const savedTheme = localStorage.getItem('nk-theme') as 'light' | 'dark' | null;
    const t = savedTheme || 'light';
    setTheme(t);
    applyTheme(t);
  }, []);

  const getRedirectUrl = () => {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028';
    return `${base}/auth/callback?next=/ai-topper-chat`;
  };

  /* ── Google OAuth ── */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl() },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
      return;
    }
    if (data?.url) {
      window.location.assign(data.url);
    }
  };

  /* ── Email step ── */
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) { setError('Email address is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) { setError('Please enter a valid email address'); return; }
    setError(null);
    setEmail(trimmed);
    setStep('password');
  };

  /* ── Guest ── */
  const handleGuestContinue = () => {
    setGuestModeEnabled(true);
    toast.success('Continuing as guest');
    router.push('/ai-topper-chat');
  };

  /* ── Password / signup step ── */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Password is required'); return; }
    if (isSignUp && password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || email.split('@')[0] },
          emailRedirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Email confirmation required
      if (data.user && !data.session) {
        setStep('confirm');
        setIsLoading(false);
        return;
      }

      // Auto-confirm is ON (rare in free tier)
      clearGuestModeEnabled();
      toast.success('Account created! Welcome to e-Mate.');
      router.push('/ai-topper-chat');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid credentials')
        ) {
          setError('Invalid email or password. Try again or create a new account.');
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.session) {
        clearGuestModeEnabled();
        toast.success('Welcome back!');
        router.push('/ai-topper-chat');
      }
    }
  };

  /* ── Forgot password ── */
  const handleForgotPassword = async () => {
    if (!email) { toast.error('Enter your email first'); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getRedirectUrl()}?next=/`,
    });
    if (error) { toast.error(error.message); }
    else { toast.success('Password reset email sent! Check your inbox.'); }
  };

  /* ── Resend confirmation ── */
  const handleResendConfirmation = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) { toast.error(error.message); }
    else { toast.success('Confirmation email resent!'); }
  };

  /* ─────── Styles ─────── */
  const isDark = theme === 'dark';
  const bg = isDark ? '#000000' : '#ffffff';
  const fg = isDark ? '#ffffff' : '#000000';
  const cardBg = isDark ? '#111111' : '#f9f9fb';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  const btnPrimaryBg = isDark ? '#ffffff' : '#000000';
  const btnPrimaryFg = isDark ? '#000000' : '#ffffff';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const socialBg = isDark ? '#1e1e1e' : '#f4f4f6';
  const socialBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mutedFg = isDark ? '#71717a' : '#a1a1aa';

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between items-center px-4 py-6 sm:py-10 relative font-sans transition-colors duration-500"
      style={{ background: bg, color: fg, fontFamily: "'Inter', sans-serif" }}
    >
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-10 blur-[120px] rounded-full"
          style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)' }}
        />
      </div>

      {/* Logo bar */}
      <div className="w-full flex justify-between items-center max-w-[440px] z-10 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border" style={{ borderColor: cardBorder, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <g transform="rotate(-35 12 12)">
                <rect x="5" y="4" width="6" height="16" rx="2" fill={fg} />
                <rect x="13" y="4" width="6" height="16" rx="2" fill={fg} />
              </g>
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: mutedFg }}>e-Mate AI</p>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-[440px] border rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 my-auto transition-all"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        {/* Close */}
        <button
          onClick={() => window.location.assign('/')}
          className="absolute right-5 top-5 p-1.5 rounded-full transition"
          style={{ color: mutedFg }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* ── Confirm screen ── */}
        {step === 'confirm' ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#10a37f]/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-[#10a37f]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: fg }}>Check your email</h2>
              <p className="text-sm leading-relaxed px-4" style={{ color: mutedFg }}>
                We sent a confirmation link to{' '}
                <span className="font-medium" style={{ color: fg }}>{email}</span>.
                Click the link to activate your account.
              </p>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: cardBorder }}
            >
              <Mail size={16} style={{ color: mutedFg }} className="shrink-0" />
              <p className="text-xs" style={{ color: mutedFg }}>
                Didn&apos;t receive it? Check spam or{' '}
                <button onClick={handleResendConfirmation} className="text-[#10a37f] hover:underline font-medium">
                  resend
                </button>
              </p>
            </div>
            <button
              onClick={() => { setStep('email'); setIsSignUp(false); setError(null); }}
              className="text-sm transition" style={{ color: mutedFg }}
            >
              ← Back to sign in
            </button>
          </div>

        ) : step === 'email' ? (
          /* ── Email step ── */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: fg }}>
                {isSignUp ? 'Create account' : 'Log in or sign up'}
              </h2>
              <p className="text-xs sm:text-sm leading-normal px-2" style={{ color: mutedFg }}>
                AI-powered study copilot for university students.
              </p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-xs text-red-400 border border-red-500/20 bg-red-500/5">{error}</div>
            )}

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-12 flex items-center justify-center gap-3 border rounded-full text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: socialBg, borderColor: socialBorder, color: fg }}
            >
              {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: dividerColor }} />
              <span className="text-[10px] font-bold tracking-wider" style={{ color: mutedFg }}>OR</span>
              <div className="flex-1 h-px" style={{ background: dividerColor }} />
            </div>

            {/* Guest */}
            <button
              type="button"
              onClick={handleGuestContinue}
              className="w-full h-11 border rounded-full text-sm font-medium transition-all"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? '#d4d4d8' : '#3f3f46' }}
            >
              Continue as Guest
            </button>

            {/* Email form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-5 bg-transparent border rounded-2xl text-sm placeholder-zinc-500 focus:outline-none transition-all"
                style={{ borderColor: inputBorder, color: fg }}
              />
              <button
                type="submit"
                className="w-full h-12 text-sm font-semibold rounded-full transition-all flex items-center justify-center"
                style={{ background: btnPrimaryBg, color: btnPrimaryFg }}
              >
                Continue with email
              </button>
            </form>

            <p className="text-center text-xs" style={{ color: mutedFg }}>
              {isSignUp ? (
                <>Already have an account?{' '}
                  <button onClick={() => { setIsSignUp(false); setError(null); }} className="text-[#10a37f] hover:underline font-semibold">Sign in</button>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <button onClick={() => { setIsSignUp(true); setError(null); }} className="text-[#10a37f] hover:underline font-semibold">Sign up</button>
                </>
              )}
            </p>
          </div>

        ) : (
          /* ── Password step ── */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <button
                onClick={() => { setStep('email'); setError(null); }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold mb-2 transition"
                style={{ color: mutedFg }}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: fg }}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-xs truncate px-4" style={{ color: mutedFg }}>{email}</p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-xs text-red-400 border border-red-500/20 bg-red-500/5">{error}</div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Full name (optional)"
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-5 bg-transparent border rounded-2xl text-sm placeholder-zinc-500 focus:outline-none transition-all"
                  style={{ borderColor: inputBorder, color: fg }}
                />
              )}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Password'}
                  value={password}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-5 pr-12 bg-transparent border rounded-2xl text-sm placeholder-zinc-500 focus:outline-none transition-all"
                  style={{ borderColor: inputBorder, color: fg }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition"
                  style={{ color: mutedFg }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-sm font-semibold rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: btnPrimaryBg, color: btnPrimaryFg }}
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> {isSignUp ? 'Creating account...' : 'Signing in...'}</>
                ) : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs" style={{ color: mutedFg }}>
              {isSignUp ? (
                <>Already have an account?{' '}
                  <button onClick={() => { setIsSignUp(false); setError(null); }} className="text-[#10a37f] hover:underline font-semibold">Sign in</button>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <button onClick={() => { setIsSignUp(true); setError(null); }} className="text-[#10a37f] hover:underline font-semibold">Sign up</button>
                </>
              )}
            </p>

            {!isSignUp && (
              <button
                onClick={handleForgotPassword}
                className="block mx-auto text-xs transition hover:text-[#10a37f]"
                style={{ color: mutedFg }}
              >
                Forgot password?
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="w-full max-w-[500px] text-center text-[10px] sm:text-[11px] leading-normal px-4 z-10 mt-4" style={{ color: mutedFg }}>
        By continuing you agree to our{' '}
        <span className="underline cursor-pointer">Terms &amp; Privacy Policy</span>.
        Chats may be reviewed to improve our models.{' '}
        <span className="underline cursor-pointer">Learn more</span>
      </div>
    </div>
  );
}
