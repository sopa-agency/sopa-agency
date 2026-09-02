// src/components/HeroVision.tsx
// Hero section for the home page after orb dissolves
'use client';

import { site } from '@/data/site';

export default function HeroVision({ locale, scrollP, className = '' }: { locale: string; scrollP: number; className?: string }) {
  const l = locale as keyof typeof site;
  const t = site[l] ?? site.en;

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center text-center px-6 pb-20 ${className}`}
      style={{ opacity: 1 - scrollP }}
    >
      <div className="page-anim font-futura pointer-events-auto max-w-5xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 font-mono text-xs text-amber-200 backdrop-blur-sm">
          <span>Web</span>
          <span className="opacity-40">·</span>
          <span>AI</span>
          <span className="opacity-40">·</span>
          <span>Base</span>
        </div>
        <h1
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-6"
          style={{ textShadow: '0 8px 40px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.6)' }}
        >
          {t.title}
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-white/95 mb-4 tracking-tight"
          style={{ textShadow: '0 8px 40px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.6)' }}
        >
          {t.tagline}
        </p>
        <p className="text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          style={{ textShadow: '0 8px 40px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.6)' }}
        >
          {t.description}
        </p>
        <span className="mt-12 inline-block text-xs opacity-40 animate-pulse pointer-events-auto">↓</span>
      </div>
    </div>
  );
}