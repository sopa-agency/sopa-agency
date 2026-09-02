# SOPA Agency — Agent Development Guide

This file documents the design patterns, animation conventions, and architectural decisions used across the site. Follow these when adding new pages or editing existing ones.

## 1. Section Structure (LayoutClient)

All sections live in `src/app/[locale]/LayoutClient.tsx` and render conditionally based on `section` state.

```tsx
type Section = 'home' | 'work' | 'team' | 'portfolio' | 'solutions' | 'about' | 'contact';
```

**Pattern for a new section:**
```tsx
{section === 'your-section' && (
  <div className="max-w-7xl mx-auto px-6 py-16">
    <h2 className="text-3xl font-bold mb-2 page-title-anim">{title}</h2>
    <p className="mb-6 opacity-70 page-title-anim page-title-anim-d1">{subtitle}</p>
    {/* content */}
  </div>
)}
```

- Title → `.page-title-anim` (slides from right, 0.85s cubic-bezier)
- Subtitle/body → `.page-title-anim-d1` (0.12s delay)
- Content grid → `.page-anim .page-anim-d1` (drifts up, 0.15s delay)

## 2. Animation Classes (globals.css)

| Class | Effect | Duration | Delay variants |
|-------|--------|----------|----------------|
| `.page-title-anim` | Slide from right (80px) | 0.85s | `.page-title-anim-d1` (0.12s), `.page-title-anim-d2` (0.24s) |
| `.page-anim` | Fade + drift up (40px) | 0.8s | `.page-anim-d1` (0.15s), `.page-anim-d2` (0.30s) |
| `.aos-zoom` | Scale 0.6 → 1 + fade | 1s | `.aos-zoom-d1` (0.5s), `.aos-zoom-d2` (0.7s) |
| `.slide-from-right` | Legacy alias for title | 0.9s | `.slide-from-right-d1` (0.15s) |
| `.animate-scroll-fade-in-up` | Fade + drift up (40px), re-triggers on re-entry via `useInView` | 0.8s | `-d1` (0.15s), `-d2` (0.30s), `-d3` (0.45s) |

**Usage:**
```tsx
<h2 className="text-3xl font-bold mb-2 page-title-anim">Title</h2>
<p className="opacity-70 page-title-anim page-title-anim-d1">Subtitle</p>
<div className="grid gap-6 page-anim page-anim-d1">...</div>
```

## 3. Page Transition (Orb + Bar Wipe)

**TransitionOverlay.tsx** provides `withWipe(onNavigate)`:
- Adds `.wipe` class to `#top-bar` and `#bottom-bar`
- After 500ms calls `onNavigate` (section change + scroll to top)

**LayoutClient navigate:**
```tsx
const navigate = (s: Section) => {
  if (s === section) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  withWipe(() => { window.scrollTo({ top: 0 }); setSection(s); });
};
```

**Orb state:**
- Home: `orbOpen = scrollP` (0→1 as user scrolls down hero)
- Other sections: `orbOpen = menuOpenAnim` (animates 0→1 on entry, stays open)
- `menuOpenAnim` driven by `requestAnimationFrame` easeOutCubic over 850ms

**WebGL receives:**
```tsx
<WebGL section={section} open={orbOpen} onProgress={setProgress} />
```
- `section` string for per-page shader variants
- `open` 0–1 controls orb unfold
- `onProgress` fires when first frame renders (loader gate)

## 4. Fonts (Font Theme System)

Each theme is a distinct visual mode — its own **font trio** (display + body + mono) **and**
its own **orb / background / glow colour**. Switchable at runtime via the pill bottom-right
(`ThemeSwitcher.tsx`), persisted to `localStorage: sopa-font-theme`. Fonts load via
`next/font/google` in `src/app/layout.tsx` — only the default trio is `preload: true`.

| Theme | id | Display | Body | Mono | Accent / orb |
|---|---|---|---|---|---|
| Next-Gen AI (default) | `next-gen` | Space Grotesk | Plus Jakarta Sans | JetBrains Mono | amber `#FFE000` |
| Cybernetic | `cyber` | Space Mono | Inter | IBM Plex Mono | cyan `#22D3EE` |
| Avant-Garde | `avant-garde` | Syne | Newsreader (serif) | JetBrains Mono | cool white `#DBDEEB` |

**How it works:**
1. `src/lib/fontTheme.ts` — `useFontTheme()` hook: localStorage + `data-font-theme` on
   `<html>` + a `sopa-fonttheme` CustomEvent so the switcher and `LayoutClient` stay in sync.
   Also exports `THEME_TINT` (orb RGB per theme).
2. `layout.tsx` has a pre-paint inline `<script>` that applies the saved theme before first
   paint (no font/colour flash for returning visitors).
3. `globals.css` — each `:root[data-font-theme="…"]` block sets `--font-display/body/code`
   **plus** `--background` and `--accent-rgb` (bare channels for `rgba(var(--accent-rgb), a)`
   glows). Tailwind exposes the font vars via `@theme inline` → `font-sans` / `font-display`
   / `font-mono`.
4. Section `<h2>`s carry the `font-display` class explicitly (a global `h1..h4` rule would
   break the mono ASCII in `HumanMachineSwitcher`). Card titles stay in the body font.
5. `LayoutClient` reads the theme → passes `THEME_TINT[theme]` to `<WebGL tint>` (the shader
   eases `uTint`); work-hover colour still overrides.

**Add a theme:** load its fonts in `layout.tsx` (`preload: false`), add a
`:root[data-font-theme]` block in `globals.css`, add entries to `FONT_THEMES` + `THEME_TINT`
in `fontTheme.ts` and `THEMES` in `ThemeSwitcher.tsx`.

**Chrome stays amber:** the `amber-*` utilities (buttons, borders, folio, nav) are *not*
themed — only orb, `--background`, and the radial glows recolour.

## 5. Colour Palette (Amber/Black)

```css
:root { --background: #0a0a0a; --foreground: #ededed; --accent-rgb: 255, 224, 0; }
```
- Primary accent: `amber-300` / `amber-400` / `amber-600` — UI chrome, **not** theme-swapped
- `--background` + `--accent-rgb`: overridden per `:root[data-font-theme]` (see §4). Use
  `rgba(var(--accent-rgb), a)` for orb-adjacent glows so they follow the theme; use the
  `amber-*` utilities for everything else.
- Backgrounds: `black/40` with `backdrop-blur-sm`
- Borders: `border-white/15` or `border-white/20`
- Text: `text-white`, `text-white/70`, `text-white/50`, `text-white/30`

## 6. Data Files (Module System)

No CMS. Each section has a `src/data/*.ts` file exporting locale-keyed objects.

```ts
// src/data/your-section.ts
export const yourSection = {
  en: { title: 'Title', subtitle: 'Subtitle', list: [...] },
  pt: { title: 'Título', subtitle: 'Legenda', list: [...] },
};
```
Import in LayoutClient:
```ts
import { yourSection } from '@/data/your-section';
const data = yourSection[l] ?? yourSection.en;
```

## 7. Components Reuse

| Component | Purpose | Props |
|-----------|---------|-------|
| `Team` | Member cards with skills, AI badge | `title`, `subtitle`, `locale` |
| `Solutions` | Sticky card stack (zeitmedia style) | `title`, `locale` |
| `Contact` | Terminal form + LLM chat (3 turns) | `title`, `locale` |
| `HeroVision` | Home hero — fades out as `scrollP` → 1 | `locale`, `scrollP`, `className` |
| `PhilosophyGrid` | Home "how we ship" 3-step + CTA card | `locale`, `className` |
| `WorksSolutionsGrid` | Home services 3-col grid | `locale`, `className` |
| `AboutNetwork` | Home "human/machine" glass statement card | `locale`, `className` |
| `ContactActionCenter` | Home closing CTA + social/network grid | `locale`, `className` |
| `Showreel` | Video modal | `videoUrl`, `onClose` |
| `Loader` | Top progress bar | `progress` 0–1, `done` boolean |

## 8. Adding a New Page Checklist

1. Add section to `Section` union type in LayoutClient.
2. Create `src/data/your-section.ts` with `en`/`pt` content.
3. Import data in LayoutClient.
4. Add conditional render block using animation classes above. Render `<SectionFolio section="…" locale={locale} />` as the first child, above the `<h2>`.
5. Add locale strings to `src/data/i18n.ts` (menu labels) and the section key to `folioOrder` there.
6. Add menu links in `Header.tsx` and `MobileMenu.tsx` (both take `onNavigate`).
7. Add `orbOpacity` entry in `WebGL.tsx` if custom orb visibility needed.
8. Run `pnpm run lint && pnpm run build` to verify.

## 9. Lint / Build Commands

```bash
pnpm run lint   # ESLint (0 errors required)
pnpm run build  # Next.js production build
hermes verify   # Full verification (install, build, lint, readiness)
```

## 10. Ponytail Rules Applied Here

- Reuse existing animation classes; don't write new keyframes.
- Keep data in `src/data/*.ts`; no new CMS or API routes unless necessary.
- One component per concern; delete over addition.
- Stdlib / native CSS over JS animation libraries.
- Fewest files: edit LayoutClient + one data file + i18n for a new page.