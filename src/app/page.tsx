'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { applyTheme } from '@/lib/theme';

import { createClient } from '@/lib/supabase/client';
import { isGuestModeEnabled } from '@/lib/guest-mode';

export default function LandingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on initial render & sync with body/components
  useEffect(() => {
    const savedTheme = localStorage.getItem('nk-theme') as 'light' | 'dark' | null;
    const t = savedTheme || 'light';
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('nk-theme', nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
      />

      <div className={`nk-hero-container ${theme}-theme`}>
        <style>{`
          .nk-hero-container {
            position: relative;
            min-height: 100vh;
            width: 100%;
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            transition: background-color 0.5s ease;
          }

          .nk-hero-container.dark-theme {
            background-color: #000000;
            color: #ffffff;
          }
          .nk-hero-container.light-theme {
            background-color: #ffffff;
            color: #000000;
          }

          .nk-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            pointer-events: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
          }

          @media (min-width: 768px) {
            .nk-nav {
              padding: 24px 32px;
            }
          }

          .nk-nav-left, .nk-nav-right {
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          @media (min-width: 768px) {
            .nk-nav-left, .nk-nav-right {
              gap: 12px;
            }
          }

          .nk-logo-group {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: inherit;
          }

          .nk-logo-icon {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .nk-brand-text {
            font-size: 14px;
            font-weight: 600;
            letter-spacing: -0.01em;
            display: none;
          }

          @media (min-width: 768px) {
            .nk-brand-text {
              display: block;
            }
          }

          .nk-menu-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #000000;
            color: #ffffff;
            border: none;
            border-radius: 9999px;
            padding: 4px 12px 4px 4px;
            cursor: pointer;
            font-weight: 500;
            transition: transform 0.2s ease;
          }
          
          .light-theme .nk-menu-btn {
            background-color: #000000;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }

          .nk-menu-btn:hover {
            transform: scale(1.02);
          }

          .nk-menu-plus-circle {
            width: 24px;
            height: 24px;
            background-color: #ffffff;
            color: #000000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .nk-menu-text {
            font-size: 11px;
            letter-spacing: 0.02em;
          }

          .nk-tags-pill {
            display: none;
            align-items: center;
            gap: 12px;
            background-color: #F4F4F6;
            color: #6C6C70;
            border-radius: 9999px;
            padding: 6px 16px;
            font-size: 11px;
            font-weight: 500;
          }

          .dark-theme .nk-tags-pill {
            background-color: rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.65);
          }

          @media (min-width: 768px) {
            .nk-tags-pill {
              display: flex;
            }
          }

          .nk-tag-divider {
            width: 1px;
            height: 10px;
            background-color: rgba(0,0,0,0.1);
          }
          .dark-theme .nk-tag-divider {
            background-color: rgba(255,255,255,0.15);
          }

          .nk-right-pill {
            display: none;
            align-items: center;
            gap: 10px;
            background-color: #F4F4F6;
            color: #000000;
            border-radius: 9999px;
            padding: 4px 6px 4px 16px;
            font-size: 11px;
            font-weight: 500;
          }

          .dark-theme .nk-right-pill {
            background-color: rgba(255, 255, 255, 0.08);
            color: #ffffff;
          }

          @media (min-width: 768px) {
            .nk-right-pill {
              display: flex;
            }
          }

          .nk-grid-btn {
            width: 24px;
            height: 24px;
            background-color: #000000;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
          }
          .dark-theme .nk-grid-btn {
            background-color: #ffffff;
          }

          .nk-video-wrapper {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 0;
            pointer-events: none;
            overflow: hidden;
            border-radius: 20px;
            width: 80%;
            height: 80%;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          }

          .dark-theme .nk-video-wrapper {
            box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          }

          @media (min-width: 768px) {
            .nk-video-wrapper {
              width: 80%;
              height: 80%;
              border-radius: 20px;
            }
          }

          .nk-bg-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .nk-theme-toggle-btn {
            pointer-events: auto;
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: #ffffff;
            color: #000000;
            border-radius: 9999px;
            padding: 6px 14px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .dark-theme .nk-theme-toggle-btn {
            background: #000000;
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.15);
          }

          .nk-theme-toggle-btn:hover {
            transform: scale(1.02);
            border-color: rgba(0, 0, 0, 0.25);
          }

          .dark-theme .nk-theme-toggle-btn:hover {
            border-color: rgba(255, 255, 255, 0.35);
          }

          .nk-footer {
            position: relative;
            z-index: 30;
            pointer-events: auto;
            width: 100%;
            margin-top: auto;
            padding: 80px 24px 32px 24px;
            background: linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.85) 60%, transparent 100%);
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .dark-theme .nk-footer {
            background: linear-gradient(to top, #000000 0%, rgba(0,0,0,0.85) 60%, transparent 100%);
          }

          @media (min-width: 768px) {
            .nk-footer {
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-end;
              padding: 120px 48px 48px 48px;
            }
          }

          .nk-foot-left {
            max-w-2xl;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .nk-subtitle-line {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .nk-sub-dot {
            width: 8px;
            height: 8px;
            background-color: #000000;
            border-radius: 50%;
          }
          .dark-theme .nk-sub-dot {
            background-color: #ffffff;
          }

          .nk-subtitle-text {
            font-size: 13px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.55);
            letter-spacing: -0.01em;
          }
          .dark-theme .nk-subtitle-text {
            color: rgba(255, 255, 255, 0.55);
          }

          .nk-heading {
            font-weight: 300;
            letter-spacing: -0.03em;
            line-height: 1.05;
            margin: 0;
            font-size: clamp(2rem, 8vw, 4.5rem);
          }

          @media (min-width: 768px) {
            .nk-heading {
              font-size: clamp(2.5rem, 5.5vw, 4.5rem);
            }
          }

          .nk-foot-btns {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
          }

          .nk-btn-primary {
            background-color: #000000;
            color: #ffffff;
            border: none;
            border-radius: 9999px;
            padding: 12px 24px;
            font-size: 13px;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            position: relative;
            z-index: 50;
            pointer-events: auto;
            transition: all 0.2s ease;
          }
          .dark-theme .nk-btn-primary {
            background-color: #ffffff;
            color: #000000;
          }

          .nk-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .nk-btn-secondary {
            background-color: transparent;
            color: #000000;
            border: 1px solid rgba(0, 0, 0, 0.35);
            border-radius: 9999px;
            padding: 12px 24px;
            font-size: 13px;
            font-weight: 500;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .dark-theme .nk-btn-secondary {
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.35);
          }

          .nk-btn-secondary:hover {
            transform: translateY(-1px);
            border-color: rgba(0, 0, 0, 0.6);
            background-color: rgba(0, 0, 0, 0.02);
          }
          .dark-theme .nk-btn-secondary:hover {
            border-color: rgba(255, 255, 255, 0.6);
            background-color: rgba(255, 255, 255, 0.05);
          }

          .nk-foot-right {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
          }

          .nk-foot-tag {
            background-color: #ffffff;
            color: #000000;
            border: 1px solid rgba(0, 0, 0, 0.12);
            border-radius: 9999px;
            padding: 6px 14px;
            font-size: 11px;
            font-weight: 500;
          }

          .dark-theme .nk-foot-tag {
            background-color: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.85);
            border-color: rgba(255, 255, 255, 0.15);
          }
        `}</style>

        {/* 1. Navbar */}
        <motion.nav
          className="nk-nav"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="nk-nav-left">
            <Link href="/" className="nk-logo-group">
              <span className="nk-logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <g transform="rotate(-35 12 12)">
                    <rect x="5" y="4" width="6" height="16" rx="2" fill="currentColor" />
                    <rect x="13" y="4" width="6" height="16" rx="2" fill="currentColor" />
                  </g>
                </svg>
              </span>
              <span className="nk-brand-text">e-Mate AI</span>
            </Link>

            <Link
              href="/sign-up-login-screen"
              className="nk-menu-btn"
              onClick={() => {
                window.location.href = '/sign-up-login-screen';
              }}
            >
              <span className="nk-menu-plus-circle">
                <Plus size={12} strokeWidth={3} />
              </span>
              <span className="nk-menu-text">Menu</span>
            </Link>

            <div className="nk-tags-pill">
              <span>Study Sprints</span>
              <span className="nk-tag-divider" />
              <span>Exam Prep AI</span>
            </div>
          </div>

          <div className="nk-nav-right">
            <Link
              href="/sign-up-login-screen"
              className="nk-theme-toggle-btn"
              style={{ textDecoration: 'none' }}
              onClick={() => {
                window.location.href = '/sign-up-login-screen';
              }}
            >
              Sign In
            </Link>

            <div className="nk-right-pill">
              <span>Academic Copilot</span>
              <button className="nk-grid-btn" type="button" aria-label="Menu Grid">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="2" y="2" width="3" height="3" rx="0.5" fill={theme === 'dark' ? '#000000' : '#ffffff'} />
                  <rect x="7" y="2" width="3" height="3" rx="0.5" fill={theme === 'dark' ? '#000000' : '#ffffff'} />
                  <rect x="2" y="7" width="3" height="3" rx="0.5" fill={theme === 'dark' ? '#000000' : '#ffffff'} />
                  <rect x="7" y="7" width="3" height="3" rx="0.5" fill={theme === 'dark' ? '#000000' : '#ffffff'} />
                </svg>
              </button>
            </div>

            <button className="nk-theme-toggle-btn" onClick={toggleTheme} type="button">
              {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </button>
          </div>
        </motion.nav>

        {/* 2. Full-Screen Video Background */}
        <motion.div
          className="nk-video-wrapper"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <video
            className="nk-bg-video"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </motion.div>

        {/* 3. Footer content */}
        <motion.footer
          className="nk-footer"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="nk-foot-left">
            <motion.div
              className="nk-subtitle-line"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="nk-sub-dot" />
              <span className="nk-subtitle-text">Your AI Academic Copilot for 2026</span>
            </motion.div>

            <motion.h1
              className="nk-heading"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              Study Smarter.
              <br />
              Score Higher.
            </motion.h1>

            <motion.div
              className="nk-foot-btns"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/sign-up-login-screen" className="nk-btn-primary">
                Get Started <ArrowRight size={14} />
              </Link>
              <Link href="/ai-topper-chat" className="nk-btn-secondary">
                Try Demo Chat
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="nk-foot-right"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="nk-foot-tag">GGSIPU</div>
            <div className="nk-foot-tag">DTU</div>
            <div className="nk-foot-tag">NSUT</div>
          </motion.div>
        </motion.footer>
      </div>
    </>
  );
}
