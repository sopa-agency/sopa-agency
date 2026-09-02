// src/components/ThemeSwitcher.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFontTheme, type FontTheme } from '@/lib/fontTheme';

type ThemeMeta = {
  id: FontTheme;
  name: string;
  fontVar: string; // display font — the row name renders in it
  pairing: string;
  dot: string; // accent swatch
  isDefault?: boolean;
};

const THEMES: ThemeMeta[] = [
  {
    id: 'avant-garde',
    name: 'Avant-Garde',
    fontVar: 'var(--font-syne)',
    pairing: 'Syne · Newsreader · JetBrains Mono',
    dot: '#DBDEEB',
    isDefault: true,
  },
  {
    id: 'next-gen',
    name: 'Next-Gen AI',
    fontVar: 'var(--font-space-grotesk)',
    pairing: 'Space Grotesk · Plus Jakarta · JetBrains Mono',
    dot: '#FFE000',
  },
  {
    id: 'cyber',
    name: 'Cybernetic',
    fontVar: 'var(--font-space-mono)',
    pairing: 'Space Mono · Inter · IBM Plex Mono',
    dot: '#22D3EE',
  },
];

export default function ThemeSwitcher() {
  const [currentTheme, setTheme] = useFontTheme();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [isOpen]);

  const select = (id: FontTheme) => {
    setTheme(id);
    setIsOpen(false);
  };

  const active = THEMES.find((t) => t.id === currentTheme) ?? THEMES[0];

  return (
    <div className="relative" ref={rootRef}>
      {isOpen && (
        <div
          role="menu"
          aria-label="Appearance"
          className="absolute bottom-full right-0 z-[62] mb-2 w-[248px] max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto p-2 rounded-xl border border-white/20 bg-black/95 backdrop-blur-xl shadow-2xl flex flex-col gap-1 menu-link-in"
        >
          <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-white/50 border-b border-white/10 mb-1">
            Appearance
          </div>
          {THEMES.map((t) => {
            const selected = currentTheme === t.id;
            return (
              <button
                key={t.id}
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => select(t.id)}
                className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg text-left border transition-colors ${
                  selected
                    ? 'border-amber-400/40 bg-amber-400/15 text-amber-300'
                    : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2 w-full">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20"
                    style={{ background: t.dot }}
                  />
                  <span className="text-base leading-none" style={{ fontFamily: t.fontVar }}>
                    {t.name}
                  </span>
                  {t.isDefault && (
                    <span className="ml-auto text-[9px] font-mono uppercase tracking-wider text-white/35">
                      default
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-mono text-white/45">{t.pairing}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Appearance: ${active.name}`}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 bg-black/80 backdrop-blur-md text-white text-xs hover:border-amber-400 hover:text-amber-300 transition-all shadow-lg cursor-pointer"
      >
        <span className="font-mono text-amber-400 font-bold">Aa</span>
        <span className="hidden sm:inline opacity-80">{active.name}</span>
        <span className="text-[10px] opacity-50">▼</span>
      </button>
    </div>
  );
}
