// src/lib/fontTheme.ts
// Shared font-theme state. The switcher and LayoutClient both read/write through
// here so the picker and the orb tint stay in sync. Persistence is localStorage
// ('sopa-font-theme'); cross-component updates ride a window CustomEvent.
'use client';
import { useEffect, useState } from 'react';

export type FontTheme = 'next-gen' | 'cyber' | 'avant-garde';
export const FONT_THEMES: FontTheme[] = ['next-gen', 'cyber', 'avant-garde'];

const STORAGE_KEY = 'sopa-font-theme';
const EVENT = 'sopa-fonttheme';

// Orb tint (RGB 0–1) per theme — consumed by <WebGL tint={…}>.
export const THEME_TINT: Record<FontTheme, [number, number, number]> = {
  'next-gen': [1.0, 0.8, 0.0], // amber
  cyber: [0.13, 0.83, 0.93], // cyan
  'avant-garde': [0.86, 0.87, 0.92], // cool white
};

export function getStoredFontTheme(): FontTheme {
  if (typeof window === 'undefined') return 'avant-garde';
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    if (t && (FONT_THEMES as string[]).includes(t)) return t as FontTheme;
  } catch {
    /* private mode / disabled storage */
  }
  return 'avant-garde';
}

export function useFontTheme(): [FontTheme, (t: FontTheme) => void] {
  // SSR and the first client render must both be 'avant-garde' (the default
  // theme) to avoid a hydration mismatch. layout.tsx's pre-paint script has
  // already set data-font-theme on <html>; we reconcile React state to it
  // right after mount.
  const [theme, setThemeState] = useState<FontTheme>('avant-garde');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync after mount, avoids hydration mismatch
    setThemeState(getStoredFontTheme());
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<FontTheme>).detail;
      if (next) setThemeState(next);
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const setTheme = (t: FontTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.fontTheme = t;
    window.dispatchEvent(new CustomEvent<FontTheme>(EVENT, { detail: t }));
  };

  return [theme, setTheme];
}
