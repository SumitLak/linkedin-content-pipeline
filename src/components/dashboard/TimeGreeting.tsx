'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';

const QUOTES = [
  { text: "Your brand is what people say about you when you're not in the room.", author: "Jeff Bezos" },
  { text: "Content is fire, social media is gasoline.", author: "Jay Baer" },
  { text: "People don't buy what you do, they buy why you do it.", author: "Simon Sinek" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Consistency is more important than perfection.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Create content that teaches. You can't give up.", author: "Gary Vaynerchuk" },
  { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
  { text: "Your network is your net worth.", author: "Porter Gale" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Small acts of consistency compound into extraordinary results.", author: "James Clear" },
  { text: "Post with intention. Engage with purpose. Grow with patience.", author: "Unknown" },
  { text: "Every expert was once a beginner who kept showing up.", author: "Unknown" },
];

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

const CONFIG: Record<TimeOfDay, {
  label: string; greeting: string; emoji: string;
  bg: string; dark: boolean; particles: string[]; particleColor: string;
}> = {
  morning: {
    label: 'MORNING',
    greeting: 'Good Morning',
    emoji: '🌅',
    bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 30%, #fde68a 60%, #fdba74 100%)',
    dark: true,
    particles: ['✦', '☀', '✦', '🌸', '✦'],
    particleColor: 'rgba(180,90,0,0.5)',
  },
  afternoon: {
    label: 'AFTERNOON',
    greeting: 'Good Afternoon',
    emoji: '☀️',
    bg: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 30%, #38bdf8 60%, #7dd3fc 100%)',
    dark: true,
    particles: ['☁', '✦', '☁', '✦', '🌤'],
    particleColor: 'rgba(255,255,255,0.6)',
  },
  evening: {
    label: 'EVENING',
    greeting: 'Good Evening',
    emoji: '🌆',
    bg: 'linear-gradient(135deg, #dc2626 0%, #f97316 25%, #ec4899 55%, #7c3aed 100%)',
    dark: false,
    particles: ['★', '✦', '★', '✦', '🌙'],
    particleColor: 'rgba(255,240,180,0.7)',
  },
  night: {
    label: 'NIGHT',
    greeting: 'Good Night',
    emoji: '🌙',
    bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #1e3a8a 100%)',
    dark: false,
    particles: ['★', '✦', '★', '✦', '★'],
    particleColor: 'rgba(255,255,255,0.85)',
  },
};

function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top:  `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 0.8,
      delay: `${Math.random() * 4}s`,
      duration: `${Math.random() * 2 + 1.5}s`,
    }))
  , []);

  return (
    <>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            animation: `twinkle ${s.duration} ${s.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </>
  );
}

export default function TimeGreeting() {
  const { activeProfile } = useProfile();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [mounted, setMounted] = useState(false);
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    setMounted(true);
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const cfg = CONFIG[timeOfDay];
  const firstName = activeProfile?.name?.split(' ')[0] || 'there';
  const textColor = cfg.dark ? 'rgba(0,0,0,0.85)' : '#ffffff';
  const subColor  = cfg.dark ? 'rgba(0,0,0,0.6)'  : 'rgba(255,255,255,0.85)';
  const metaColor = cfg.dark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.6)';

  return (
    <div
      className="relative overflow-hidden greeting-bg"
      style={{
        backgroundImage: cfg.bg,
        animation: 'gradientShift 10s ease infinite',
        minHeight: 260,
      }}
    >
      {/* Night stars */}
      {mounted && timeOfDay === 'night' && <Stars />}

      {/* Backdrop time-of-day label */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none" aria-hidden>
        <span
          style={{
            fontSize: 'clamp(72px, 14vw, 150px)',
            fontWeight: 900,
            letterSpacing: '0.15em',
            color: cfg.dark ? '#000' : '#fff',
            animation: 'labelPulse 5s ease-in-out infinite',
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden>
        {cfg.particles.map((p, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left:  `${8 + i * 19}%`,
              top:   `${12 + (i % 3) * 22}%`,
              fontSize: `${18 + (i % 3) * 6}px`,
              color: cfg.particleColor,
              animation: `float ${3.5 + i * 0.6}s ${i * 0.5}s ease-in-out infinite`,
            }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col justify-center px-8 py-10 md:px-12">
        {/* Emoji */}
        <span className="mb-2 text-4xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {cfg.emoji}
        </span>

        {/* Greeting */}
        <h1
          className="mb-5 font-black leading-none tracking-tight animate-slide-up"
          style={{
            fontSize: 'clamp(30px, 5vw, 54px)',
            color: textColor,
            textShadow: cfg.dark ? 'none' : '0 2px 24px rgba(0,0,0,0.25)',
            animationDelay: '0.2s',
          }}
        >
          {cfg.greeting}, {firstName} 👋
        </h1>

        {/* Quote */}
        <blockquote className="max-w-2xl animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <p
            className="mb-2 font-semibold italic leading-relaxed"
            style={{
              fontSize: 'clamp(15px, 1.8vw, 20px)',
              color: subColor,
              textShadow: cfg.dark ? 'none' : '0 1px 12px rgba(0,0,0,0.2)',
            }}
          >
            "{quote.text}"
          </p>
          <footer style={{ fontSize: 13, color: metaColor, fontWeight: 500 }}>
            — {quote.author}
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
