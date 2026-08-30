'use client';

import { useEffect, useState } from 'react';
import {
  ChevronDown,
  Moon,
  Sun,
  ArrowUpRight,
  Check,
  Brain,
  MousePointer2,
  Link2,
  ShieldCheck,
} from 'lucide-react';

const logos = [
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'Computer Science',
  'Medicine',
  'Law',
  'Engineering',
];
const plans = [
  {
    name: 'Free',
    eyebrow: 'For students',
    price: '$0',
    action: 'Start Learning for Free',
    href: '/sign-up-login-screen',
    features: ['5 daily queries', 'Basic notebook uploads', 'OpenRouter BYOK support'],
  },
  {
    name: 'Growth',
    eyebrow: 'Pro teams',
    price: '$8',
    action: 'Start Learning for Free',
    href: '/sign-up-login-screen',
    featured: true,
    features: [
      '25 active agents',
      '150 simulation runs',
      'Full RAG & active recall loops',
      'Nitro routing',
    ],
  },
  {
    name: 'Scale',
    eyebrow: 'Enterprise',
    price: '$25',
    action: 'Contact sales',
    href: 'mailto:hello@emateai.ai',
    features: [
      'Unlimited active agents',
      'Unlimited simulations',
      'Dedicated workspaces',
      'Enterprise security',
    ],
  },
];

const styles = `
.site{--ink:#303030;--muted:#929292;--line:#e5e7eb;--accent:#1f51ff;--accent-bright:#1f51ff;background:#fff;color:var(--ink);font-family:Arial,Helvetica,sans-serif;min-height:100vh;overflow-x:hidden}.site.dark{--ink:#f4f4f4;--muted:#a3a3a3;--line:#383838;--accent-bright:#8aa2ff;background:#171717;color:var(--ink)}.site *{box-sizing:border-box}.nav-shell{height:64px;margin:12px auto 0;max-width:calc(100% - 56px);border:1px solid var(--line);border-radius:999px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;position:sticky;top:12px;z-index:10;background:#fff;box-shadow:0 2px 4px #0000000b;animation:navIn .5s cubic-bezier(.16,.84,.32,1) both}.site.dark .nav-shell{background:#171717}.brand{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;font-size:20px;letter-spacing:-.5px;flex:1}.brand-mark{height:26px;width:26px;display:flex;align-items:center;justify-content:center;color:var(--accent-bright);flex-shrink:0}.brand-mark img{width:26px;height:26px;display:block;object-fit:contain}.nav-shell nav{display:flex;gap:30px;margin:0 auto}.nav-shell nav a{color:var(--muted);font-size:15px;text-decoration:none}.nav-actions{display:flex;align-items:center;gap:16px;flex:1;justify-content:flex-end}.icon-button{border:0;background:none;color:var(--muted);cursor:pointer}.button{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:999px;padding:10px 18px;font-size:14px;line-height:1;cursor:pointer;transition:transform .2s,background .2s}.button:hover{transform:translateY(-2px)}.dark-button{background:#222;color:#fff}.site.dark .dark-button{background:#fff;color:#222}.outline-button{border:1px solid var(--line);color:inherit;background:transparent}.accent-button{background:var(--accent);color:#fff;border:0}.section-frame{border-bottom:1px solid var(--line)}.hero{position:relative;overflow:hidden;isolation:isolate;text-align:center;min-height:520px;padding:120px 24px 72px}.kicker{color:var(--accent-bright);font-size:16px;margin:0 0 16px}.kicker.shine{color:transparent;background-image:linear-gradient(110deg,var(--accent-bright) 35%,#9fb4ff 50%,var(--accent-bright) 75%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;animation:kickerShine 2s linear infinite,fadeUp .7s cubic-bezier(.16,.84,.32,1) both}
@keyframes kickerShine{0%{background-position:200% 0}100%{background-position:-200% 0}}.hero h1{font-size:52px;line-height:1.1;letter-spacing:-2px;font-weight:500;margin:0;animation:fadeUp .7s cubic-bezier(.16,.84,.32,1) .08s both}.hero h1 em{font-style:normal;color:var(--accent-bright)}.hero-copy{font-size:18px;line-height:1.6;color:var(--muted);margin:24px 0;animation:fadeUp .7s cubic-bezier(.16,.84,.32,1) .16s both}.button-row{display:flex;gap:12px;justify-content:center;animation:fadeUp .7s cubic-bezier(.16,.84,.32,1) .24s both}.hero-orbs{position:absolute;inset:0;z-index:-1;pointer-events:none}.hero-orbs i{position:absolute;border-radius:50%;filter:blur(64px);opacity:.5;will-change:transform}.hero-orbs i:nth-child(1){width:340px;height:340px;left:-90px;top:-70px;background:radial-gradient(circle,var(--accent),transparent 65%);animation:orbit1 24s ease-in-out infinite alternate}.hero-orbs i:nth-child(2){width:300px;height:300px;right:-80px;top:14%;background:radial-gradient(circle,#3782f5,transparent 65%);animation:orbit2 28s ease-in-out infinite alternate}.hero-orbs i:nth-child(3){width:200px;height:200px;left:14%;bottom:-60px;background:radial-gradient(circle,#9fb4ff,transparent 65%);animation:orbit3 22s ease-in-out infinite alternate}.site.dark .hero-orbs i{opacity:.38}@keyframes orbit1{from{transform:translate(0,0) scale(1)}to{transform:translate(60px,40px) scale(1.08)}}@keyframes orbit2{from{transform:translate(0,0) scale(1)}to{transform:translate(-50px,30px) scale(.94)}}@keyframes orbit3{from{transform:translate(0,0) scale(1)}to{transform:translate(40px,-46px) scale(1.06)}}.feature-intro{text-align:center;padding:80px 24px 80px}.feature-intro .kicker{margin-bottom:16px}.feature-intro h2,.how h2{font-size:38px;font-weight:500;letter-spacing:-1.5px;margin:0 0 18px}.feature-intro>p:last-child,.how>p:last-of-type{font-size:17px;line-height:1.6;color:var(--muted);margin:0}.feature-grid{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--line)}.feature-grid article{min-height:420px;padding:48px 40px;border-right:1px solid var(--line);overflow:hidden}.feature-grid article:last-child{border-right:0}.feature-title{display:flex;gap:12px;align-items:center}.feature-title h3{font-size:22px;font-weight:500;margin:0}.feature-grid article>p{font-size:16px;color:var(--muted);line-height:1.6;max-width:640px}.model-window,.chat-window{margin:36px 0 0;border:1px solid var(--line);border-radius:18px;width:100%;height:auto;box-shadow:0 10px 24px #0000000c;position:relative;background:#fff}.site.dark .model-window,.site.dark .chat-window{background:#202020}.window-dots{display:flex;gap:10px;padding:14px 18px}.window-dots b{width:10px;height:10px;border-radius:50%;background:#ff2f3d}.window-dots b:nth-child(2){background:#ffb800}.window-dots b:nth-child(3){background:#06c75b}.model-list{border-top:1px solid var(--line);display:flex;flex-direction:column;gap:12px;padding:16px 18px;font-size:14px}.model-list span{display:flex;align-items:center;gap:8px}.model-list small,.model-list strong{margin-left:auto;color:var(--muted);font-weight:400}.chat-window{background:radial-gradient(110% 110% at 50% 0%,#e4ebff 0%,transparent 68%);display:flex;align-items:flex-end;justify-content:flex-end;padding:20px;min-height:160px}.site.dark .chat-window{background:radial-gradient(110% 110% at 50% 0%,#1c2a5e 0%,transparent 68%)}.chat-bubble{background:#3782f5;color:#fff;border-radius:18px;padding:16px;font-size:15px;line-height:1.5}.trusted{text-align:center}.mono-label{font:600 11px/1.2 monospace;color:var(--muted);letter-spacing:1.5px;text-align:center;margin:0;padding:40px 16px 28px}.logo-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line)}.logo{height:120px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:500;color:#333}.site.dark .logo{color:#ddd}.logo:nth-child(4n){border-right:0}.logo-0:before{content:'⚡';background:#444;color:#fff;border-radius:6px;padding:3px;margin-right:8px}.logo-1{font-weight:800;font-size:26px}.logo-2{font-weight:700}.logo-4{font-size:16px}.logo-5{font-weight:700}.how{text-align:center;padding:80px 24px 56px}.how .kicker{margin-bottom:16px}.how h2{margin-bottom:18px}.integration-card{max-width:640px;height:96px;border:1px solid var(--line);border-radius:18px;margin:32px auto 0;display:flex;align-items:center;justify-content:space-between;padding:24px 28px;font-size:16px;text-align:left}.pricing{padding:0}.price-grid{display:grid;grid-template-columns:repeat(3,1fr)}.price-card{padding:32px 26px 28px;border-right:1px solid var(--line);min-height:340px}.price-card:last-child{border-right:0}.price-card h3{font-size:20px;font-weight:500;margin:0}.eyebrow{color:var(--muted);margin:4px 0 20px;font-size:13px}.price{font-size:22px;margin-bottom:14px}.price small{font-size:13px}.price-card .button{width:100%;font-size:13px;padding:10px}.price-card ul{list-style:none;padding:16px 0 0;margin:16px 0 0;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--muted)}.price-card li{display:flex;gap:8px}.price-card.featured{background:#edf1ff}.site.dark .price-card.featured{background:#171f47}.security{display:flex;align-items:center;justify-content:space-between;padding:48px 7%;min-height:200px;position:relative}.security .mono-label{position:absolute;left:50%;transform:translateX(-50%);top:24px;padding:0}.security h2{font-size:22px;font-weight:500;margin:0 0 12px}.security p{color:var(--muted);font-size:13px;line-height:1.6}.security .button{font-size:13px;padding:10px 18px}.security-icons{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:end;color:var(--muted);font-size:11px}.security-icons svg{grid-column:span 3;justify-self:center}.faq{text-align:center;padding:56px 0 0}.faq .kicker{font-size:14px;margin-bottom:12px}.faq h2{font-size:28px;font-weight:500;margin:0 0 18px}.faq>p{color:var(--muted);line-height:1.6;font-size:13px}.faq .button{font-size:12px;padding:10px 16px}.faq-list{margin-top:24px;text-align:left}.faq-row{position:relative;width:100%;display:flex;justify-content:space-between;align-items:center;border:0;border-top:1px solid var(--line);background:transparent;color:inherit;padding:16px 18px;font-size:14px;text-align:left;cursor:pointer}.faq-row:last-child{border-bottom:1px solid var(--line)}.faq-row .rotate{transform:rotate(180deg)}.answer{position:absolute;left:18px;top:44px;color:var(--muted);font-size:13px}.faq-row:has(.answer){padding-bottom:44px}.final-cta{text-align:center;min-height:360px;padding:72px 24px 56px;overflow:hidden}.final-cta h2{font-size:34px;line-height:1.15;letter-spacing:-1px;font-weight:500;margin:48px 0 20px}.final-cta h2 em{font-style:normal;color:var(--accent-bright)}.orbit{height:22px;position:relative;max-width:300px;margin:auto;border-radius:50%;box-shadow:0 -24px 0 -23px var(--line),0 -56px 0 -55px var(--line),0 -88px 0 -87px var(--line)}.orbit span{position:absolute;background:#fff;border:1px solid var(--line);padding:6px;border-radius:6px}.site.dark .orbit span{background:#171717}.orbit span:nth-child(1){left:24%;top:5px}.orbit span:nth-child(2){left:48%;top:-14px}.orbit span:nth-child(3){right:16%;top:6px}footer{display:flex;justify-content:space-between;padding:22px 7%;color:var(--muted);font-size:13px}@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes navIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}html.js [data-reveal]{opacity:0;transform:translateY(18px);transition:opacity .7s cubic-bezier(.16,.84,.32,1),transform .7s cubic-bezier(.16,.84,.32,1)}html.js [data-reveal].in{opacity:1;transform:none}.feature-grid article[data-reveal]:nth-child(2){transition-delay:.1s}.price-card[data-reveal]:nth-child(2){transition-delay:.08s}.price-card[data-reveal]:nth-child(3){transition-delay:.16s}.button:active{transform:translateY(0) scale(.97)}.integration-card svg{transition:transform .25s}.integration-card:hover svg{transform:translate(2px,-2px)}@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}html.js [data-reveal]{opacity:1!important;transform:none!important}.hero-orbs i{animation:none!important}}@media(max-width:800px){.hero-orbs i:nth-child(1){width:230px;height:230px;left:-70px;top:-40px}.hero-orbs i:nth-child(2){width:210px;height:210px;right:-60px;top:20%}.hero-orbs i:nth-child(3){width:150px;height:150px;left:6%;bottom:10%}.nav-shell{max-width:calc(100% - 24px);height:56px;border-radius:18px}.brand{font-size:18px;gap:8px}.brand-mark{transform:scale(.8);transform-origin:left center;width:22px}.nav-shell nav{display:none}.nav-actions{gap:10px}.nav-actions .button{padding:9px 14px;font-size:13px}.hero{padding-top:88px;min-height:440px}.hero h1{font-size:34px;letter-spacing:-1px}.hero-copy{font-size:16px}.kicker{font-size:14px}.feature-intro h2,.how h2{font-size:28px}.feature-intro>p:last-child,.how>p:last-of-type{font-size:16px}.feature-grid,.price-grid{grid-template-columns:1fr}.feature-grid article{border-right:0;border-bottom:1px solid var(--line);padding:32px 24px;min-height:auto}.feature-title h3{font-size:20px}.feature-grid article>p{font-size:15px}.logo-grid{grid-template-columns:repeat(2,1fr)}.logo{height:80px;font-size:16px}.logo:nth-child(4n){border-right:1px solid var(--line)}.logo:nth-child(2n){border-right:0}.price-card{border-right:0;border-bottom:1px solid var(--line)}.security{display:block;padding:40px 24px}.security .mono-label{position:static;transform:none;margin:0 0 24px;text-align:left}.security-icons{margin-top:24px}.final-cta h2{font-size:26px}footer{display:block;line-height:2}.desktop{display:none}}
`;

export default function LandingPage() {
  const [dark, setDark] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll-reveal motion for sections below the fold. Honors prefers-reduced-motion
  // (the browser only fades them in if animation is allowed) and never leaves content
  // hidden when JavaScript is unavailable (CSS reveal is scoped behind html.js).
  useEffect(() => {
    document.documentElement.classList.add('js');
    if (
      typeof window.matchMedia !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const faqs = [
    {
      q: 'What exactly does e-Mate AI do?',
      a: 'e-Mate AI is an AI-powered study workspace that generates flashcards, quizzes, and automated RAG workflows from your uploaded notes and textbooks.',
    },
    {
      q: 'How does the BYOK OpenRouter integration work?',
      a: 'You can seamlessly connect your OpenRouter API key via 1-click authentication to stream high-speed LLM models at zero extra platform markup.',
    },
  ];

  return (
    <main className={dark ? 'site dark' : 'site'}>
      <style>{styles}</style>
      <header className="nav-shell">
        <a className="brand" href="/sign-up-login-screen" aria-label="e-Mate AI home">
          <span className="brand-mark" aria-hidden="true">
            <img src="/asset/images/e.svg" alt="" />
          </span>
          <span>e-Mate AI</span>
        </a>
        <nav>
          <a href="/sign-up-login-screen">Pricing</a>
          <a href="#about">About</a>
          <a href="#careers">Careers</a>
          <a href="#blog">Blog</a>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a className="button dark-button" href="/sign-up-login-screen">
            Start Learning for Free
          </a>
        </div>
      </header>
      <section id="top" className="hero section-frame">
        <div className="hero-orbs" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <p className="kicker shine">Built for Fast-Paced Learning &amp; Engineering Teams</p>
        <h1>
          Manage and simulate
          <br />
          AI-driven <em>study workflows</em>
        </h1>
        <p className="hero-copy">
          e-Mate empowers students and technical teams to create, simulate, and
          <br className="desktop" /> manage personalized AI study workflows, RAG notebooks, and
          agentic workflows visually.
        </p>
        <div className="button-row">
          <a className="button dark-button" href="/sign-up-login-screen">
            Start Learning for Free
          </a>
          <a className="button outline-button" href="#pricing">
            View Pricing
          </a>
        </div>
      </section>
      <section id="about" className="section-frame feature-intro" data-reveal>
        <p className="kicker">Features</p>
        <h2>
          Built for <em>Agentic &amp; Academic Intelligence</em>
        </h2>
        <p>
          Build, test, and run AI study agents and RAG workflows with a fast
          <br className="desktop" /> visual interface
        </p>
      </section>
      <section className="feature-grid">
        <article data-reveal>
          <div className="feature-title">
            <Brain size={26} />
            <h3>LLM Model Selector</h3>
          </div>
          <p>
            Track real-time activity of agents with detailed records of triggers, tools used,
            outcomes, and timestamps.
          </p>
          <div className="model-window">
            <div className="window-dots">
              <b />
              <b />
              <b />
            </div>
            <div className="model-list">
              <span>
                <Check size={13} /> All Models <small>Nitro + BYOK</small>
              </span>
              <span>
                ✦ Gemini 2.0 Flash <strong>Ultra-Fast</strong>
              </span>
              <span>
                ◉ OpenAI GPT-4o <small>GPT-4o-mini</small>
              </span>
              <span>
                ✦ Claude 3.5 Sonnet <strong>Reasoning</strong>
              </span>
            </div>
          </div>
        </article>
        <article>
          <div className="feature-title">
            <MousePointer2 size={26} />
            <h3>Text to workflow builder</h3>
          </div>
          <p>
            Type natural prompts like &quot;Create a flashcard &amp; summary workflow from my
            uploaded OS notes&quot; to preview logic in a safe sandbox before running.
          </p>
          <div className="chat-window">
            <div className="chat-bubble">
              Create a flashcard &amp; summary
              <br /> workflow from my uploaded notes
            </div>
          </div>
        </article>
      </section>
      <section className="trusted section-frame" data-reveal>
        <p className="mono-label">TRUSTED BY STUDENTS &amp; FAST-MOVING TEAMS</p>
        <div className="logo-grid">
          {logos.map((logo, i) => (
            <div key={logo} className={`logo logo-${i}`}>
              {logo}
            </div>
          ))}
        </div>
      </section>
      <section className="section-frame how" data-reveal>
        <p className="kicker">How it works</p>
        <h2>
          Start learning <em>easily</em>
        </h2>
        <p>
          Upload your notes and let e-Mate turn them into flashcards, quizzes, and study workflows
        </p>
        <div className="integration-card">
          <Link2 size={34} />
          <span>Turn your notes into flashcards &amp; quizzes</span>
          <ArrowUpRight size={24} />
        </div>
      </section>
      <section id="pricing" className="pricing section-frame">
        <div className="price-grid">
          {plans.map((plan) => (
            <article
              className={plan.featured ? 'price-card featured' : 'price-card'}
              key={plan.name}
              data-reveal
            >
              <h3>{plan.name}</h3>
              <p className="eyebrow">{plan.eyebrow}</p>
              <div className="price">
                {plan.price} <small>/seat</small>
              </div>
              <a
                className={plan.featured ? 'button accent-button' : 'button outline-button'}
                href={plan.href}
              >
                {plan.action}
              </a>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={13} />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="security section-frame" data-reveal>
        <p className="mono-label">FOR SECURITY FIRST TEAMS</p>
        <div>
          <h2>
            Scale securely <em>with confidence</em>
          </h2>
          <p>
            Our AI assistant is designed with enterprise-grade security practices and compliant with
            <br className="desktop" /> global data protection standards.
          </p>
          <a className="button dark-button" href="/sign-up-login-screen">
            Start Learning for Free
          </a>
        </div>
        <div className="security-icons">
          <ShieldCheck size={44} />
          <span>CCPA</span>
          <span>GDPR</span>
          <span>ISO</span>
        </div>
      </section>
      <section className="faq section-frame" data-reveal>
        <p className="kicker">FAQs</p>
        <h2>Frequently Asked Questions</h2>
        <p>
          Find all your doubts and questions in one place. Still couldn&apos;t find what
          <br className="desktop" /> you&apos;re looking for?
        </p>
        <div className="button-row">
          <a className="button dark-button" href="#top">
            Read Docs
          </a>
          <a className="button outline-button" href="mailto:hello@emateai.ai">
            Contact Us
          </a>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <button
              key={faq.q}
              className="faq-row"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <span>{faq.q}</span>
              <ChevronDown size={15} className={openFaq === i ? 'rotate' : ''} />
              {openFaq === i && <span className="answer">{faq.a}</span>}
            </button>
          ))}
        </div>
      </section>
      <section id="careers" className="final-cta section-frame" data-reveal>
        <div className="orbit">
          <span>
            <Link2 />
          </span>
          <span>
            <Brain />
          </span>
          <span>
            <MousePointer2 />
          </span>
        </div>
        <h2>
          Upload your syllabus
          <br />
          and Start <em>Learning</em>
        </h2>
        <a className="button dark-button" href="/sign-up-login-screen">
          Start Learning for Free
        </a>
      </section>
      <footer id="blog">
        <span>© 2026 e-Mate AI</span>
        <span>Agentic study &amp; workflow infrastructure for modern teams.</span>
      </footer>
    </main>
  );
}
