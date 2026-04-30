'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useBannerSettings } from '@/hooks/useBannerSettings';

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
    // Bright sunny countryside road — vivid blue sky, golden sun glow, lush green base
    label: 'MORNING',
    greeting: 'Good Morning',
    emoji: '🌅',
    bg: [
      'radial-gradient(ellipse 60% 40% at 52% 18%, #ffffff 0%, #fff9c4 6%, #ffe082 16%, #64b5f6 36%, #1976d2 62%, #0d47a1 100%)',
      'linear-gradient(180deg, #1565c0 0%, #42a5f5 35%, #aee6f8 58%, #c8e6c9 78%, #388e3c 100%)',
    ].join(', '),
    dark: true,
    particles: ['✦', '☀', '🌿', '🌸', '✦'],
    particleColor: 'rgba(255,220,60,0.8)',
  },
  afternoon: {
    // Orange sun-burst — brilliant amber-white core, deep burnt orange horizon
    label: 'AFTERNOON',
    greeting: 'Good Afternoon',
    emoji: '☀️',
    bg: [
      'radial-gradient(ellipse 55% 50% at 22% 18%, #ffffff 0%, #fff9c4 4%, #ffee58 12%, #ffb300 26%, #ff8f00 50%, #e65100 80%, #bf360c 100%)',
      'linear-gradient(160deg, #ff9800 0%, #ff6d00 30%, #e64a19 60%, #bf360c 100%)',
    ].join(', '),
    dark: true,
    particles: ['☀', '✦', '🔆', '✦', '🌤'],
    particleColor: 'rgba(255,255,200,0.9)',
  },
  evening: {
    // Deep purple night sky fading to fiery orange-red horizon with mountain silhouette feel
    label: 'EVENING',
    greeting: 'Good Evening',
    emoji: '🌆',
    bg: [
      'linear-gradient(180deg, #0d0030 0%, #1a0050 12%, #3d0070 25%, #7b1fa2 42%, #c62828 58%, #e53935 68%, #ef6c00 80%, #f9a825 90%, #c67c32 100%)',
    ].join(', '),
    dark: false,
    particles: ['★', '✦', '★', '✦', '🌙'],
    particleColor: 'rgba(255,220,150,0.85)',
  },
  night: {
    // Starry lake night — deep navy sky, teal mid-band, warm amber horizon glow, dark hills
    label: 'NIGHT',
    greeting: 'Good Night',
    emoji: '🌙',
    bg: [
      'linear-gradient(180deg, #010b1f 0%, #020d2a 18%, #051a3d 35%, #0a2850 52%, #0d3060 62%, #7b4520 78%, #c27840 88%, #d48c50 93%, #1a1008 100%)',
    ].join(', '),
    dark: false,
    particles: ['★', '✦', '★', '✦', '★'],
    particleColor: 'rgba(255,255,255,0.9)',
  },
};

function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
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
  const { bannerUrls } = useBannerSettings();
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
  const customImage = bannerUrls[timeOfDay];
  const firstName = activeProfile?.name?.split(' ')[0] || 'there';
  const isDark = customImage ? false : cfg.dark; // custom images always use white text (overlay darkens bg)
  const textColor = isDark ? 'rgba(0,0,0,0.85)' : '#ffffff';
  const subColor  = isDark ? 'rgba(0,0,0,0.6)'  : 'rgba(255,255,255,0.85)';
  const metaColor = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.6)';

  return (
    <div
      className="relative overflow-hidden"
      style={customImage ? {
        backgroundImage: `url(${customImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: 280,
      } : {
        background: cfg.bg,
        backgroundSize: '300% 300%',
        animation: 'gradientShift 12s ease infinite',
        minHeight: 280,
      }}
    >
      {/* Darkening overlay for custom images so text stays readable */}
      {customImage && <div className="absolute inset-0 bg-black/35" />}

      {/* Night stars (gradient mode only) */}
      {mounted && !customImage && timeOfDay === 'night' && <Stars />}

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
