// src/app/[locale]/LayoutClient.tsx
// Single-page app: WebGL/video background mounts once,
// menu clicks swap sections client-side behind the bar wipe.
'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";
import TransitionOverlay, { withWipe } from "@/components/TransitionOverlay";
import WebGL from "@/components/WebGL";
import Showreel from "@/components/Showreel";
import WorkDetail from "@/components/WorkDetail";
import Loader from "@/components/Loader";
import HeroVision from "@/components/HeroVision";
import PhilosophyGrid from "@/components/PhilosophyGrid";
import WorksSolutionsGrid from "@/components/WorksSolutionsGrid";
import AboutNetwork from "@/components/AboutNetwork";
import ContactActionCenter from "@/components/ContactActionCenter";
import { site } from "@/data/site";
import { workItems, work, workCategories, type WorkItem, type WorkCategory } from "@/data/work";
import { team } from "@/data/team";
import Team from "@/components/Team";
import Solutions from "@/components/Solutions";
import Process from "@/components/Process";
import CTA from "@/components/CTA";
import About from "@/components/About";
import Contact from "@/components/Contact";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Analytics from "@/components/Analytics";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import HumanMachineSwitcher from "@/components/HumanMachineSwitcher";
import { feed } from "@/data/feed";
import { feedPosts } from "@/data/feed";

type Section = 'home' | 'work' | 'team' | 'feed' | 'solutions' | 'about' | 'contact';

// ponytail: solutions/contact have no data files yet — inline until they earn one
const EXTRA = {
  en: {
    solutions: { title: 'Solutions', body: 'AI agents, campaign engineering, portals & onchain tooling.' },
    contact: { title: 'Contact', body: 'crew@sopa.team' },
  },
  pt: {
    solutions: { title: 'Soluções', body: 'Agentes de IA, engenharia de campanhas, portais e ferramentas onchain.' },
    contact: { title: 'Contato', body: 'crew@sopa.team' },
  },
} as const;

export default function LayoutClient({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // section derives from the URL: /en/contact → 'contact'. Shareable links work.
  const pathname = usePathname();
  const VALID_SECTIONS = ['home', 'work', 'team', 'feed', 'solutions', 'about', 'contact'];
  const pathSection = (VALID_SECTIONS.find(s => pathname.startsWith(`/${locale}/${s}`)) ?? 'home') as Section;
  const [section, setSection] = useState<Section>(pathSection);
  const isHome = section === 'home';
  const [reelUrl, setReelUrl] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<WorkItem | null>(null);
  const [progress, setProgress] = useState(0);
  const [workFilter, setWorkFilter] = useState<'all' | WorkCategory>('all');
  const [hoveredWork, setHoveredWork] = useState<WorkItem | null>(null);
  // globe/video layer: home hero opens up (orb unfolds) as you scroll into the presentation
  const [scrollP, setScrollP] = useState(0); // 0 top of hero .. 1 fully into presentation
  // menu sections: orb opens on entry and STAYS open while on that section
  const [menuOpenAnim, setMenuOpenAnim] = useState(0);
  const heroVisible = true; // orb + particles always visible as background (all pages)
  const orbOpen = section === 'home' ? scrollP : menuOpenAnim;
  const loaded = progress >= 1;

  useEffect(() => {
    if (section === 'home') return;
    // open: 0 -> 1 over ~0.85s, then stay open (orb remains unfolded behind page content)
    let start: number;
    let handle: number;
    const duration = 850;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      setMenuOpenAnim(1 - Math.pow(1 - t, 3));
      if (t < 1) handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [section]);

  useEffect(() => {
    if (section !== 'home') return;
    const onScroll = () => {
      const scrollP = Math.min(1, window.scrollY / window.innerHeight);
      setScrollP(scrollP);
      if (window.scrollY >= (document.documentElement.scrollHeight - window.innerHeight)) {
        window.scrollTo({ top: 0 });
        setScrollP(0);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [section]);

  useEffect(() => {
    // reveal gate: orb first frame (WebGL fires onProgress on its first render)
    // AND a minimum loader display time, so the loading line is actually seen
    // instead of the video flashing in first
    let ready = false;
    let minDone = false;
    function maybeReveal() {
      if (ready && minDone) setProgress(1);
    }
    const t = setTimeout(() => { minDone = true; maybeReveal(); }, 2500);
    (window as unknown as { __orbFirstFrame?: () => void }).__orbFirstFrame = () => { ready = true; maybeReveal(); };
    return () => clearTimeout(t);
  }, []);

  const l = locale as keyof typeof site;
  const t = site[l] ?? site.en;
  const ex = EXTRA[l] ?? EXTRA.en;

  const navigate = useCallback((s: Section) => {
    if (s === section) {
      // already there — just go back to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    withWipe(() => {
      window.scrollTo({ top: 0 });
      setSection(s);
      // keep URL in sync so section links are shareable
      const url = s === 'home' ? `/${locale}` : `/${locale}/${s}`;
      window.history.pushState(null, '', url);
    });
  }, [section, locale, withWipe]);

  // cross-component navigation (Contact page CTA cards)
  useEffect(() => {
    const h = (e: Event) => navigate((e as CustomEvent).detail as Section);
    window.addEventListener('sopa:navigate', h);
    return () => window.removeEventListener('sopa:navigate', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // browser back/forward: section follows the URL
  useEffect(() => {
    const onPop = () => {
      const s = (VALID_SECTIONS.find(x => window.location.pathname.startsWith(`/${locale}/${x}`)) ?? 'home') as Section;
      setSection(s);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const list = work[l]?.list ?? [];

  const filteredList = useMemo(() => {
    if (workFilter === 'all') return list;
    return list.filter(item => item.category === workFilter);
  }, [list, workFilter]);

  return (
    <>
      <Loader progress={loaded ? 1 : 0.5} done={loaded} />
      {/* Orb background — fixed, full-screen, always behind content */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out"
        style={{
          visibility: heroVisible ? 'visible' : 'hidden',
          opacity: loaded ? 1 : 0
        }}
        data-hero-bg
      >
        <div className="absolute inset-0">
          <WebGL 
            section={section} 
            open={orbOpen} 
            onProgress={setProgress} 
            tint={section === 'work' && hoveredWork?.color ? hoveredWork.color : [1.0, 0.8, 0.0]} 
          />
        </div>
      </div>

      <Analytics section={section} />
      <Header locale={locale} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} onNavigate={navigate} />

      <main className="relative z-20 flex-grow text-white pt-16">
        {children}
        {/* ghost watermark title behind content — slides up with page-anim */}
        {section !== 'home' && (
          <div key={'g' + section} className="page-anim fixed inset-x-0 top-[12vh] overflow-hidden pointer-events-none">
            <div className="ghost-title">{section}</div>
          </div>
        )}
        {section === 'home' && (
          <div className="flex flex-col h-[calc(100vh*6)] snap-y snap-mandatory overflow-y-auto scroll-smooth">
            <HeroVision locale={locale} scrollP={scrollP} className="h-screen snap-start" />
            <PhilosophyGrid locale={locale} className="min-h-screen snap-start" />
            <WorksSolutionsGrid className="h-screen snap-start" />
            <AboutNetwork locale={locale} className="h-screen snap-start" />
            <ContactActionCenter locale={locale} className="h-screen snap-start" />
            {/* ponytail: gap session so the last snap lands content centered, not pinned to bottom edge */}            <div className="h-screen snap-start" />
          </div>
        )}
        <div key={section}>
          {section === 'work' && (
            <div className="max-w-7xl mx-auto px-6 py-16">
              {/* title: slides from right */}
              <h2 className="text-3xl font-bold mb-2 page-title-anim">{work[l]?.title}</h2>
              <p className="mb-6 opacity-70 page-title-anim page-title-anim-d1">{work[l]?.subtitle}</p>
              {/* filter tabs */}
              <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Work categories">
                {(['all', ...workCategories] as const).map(cat => (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={workFilter === cat}
                    onClick={() => setWorkFilter(cat)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-xl border transition-colors ${
                      workFilter === cat
                        ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
                        : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
              {/* grid: drifts up */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 page-anim page-anim-d1">
                {filteredList.map((item, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden cursor-pointer work-tile"
                    onClick={() => item.video ? setReelUrl(item.video) : setDetailItem(item.detail ? item : null)}
                    onMouseEnter={e => {
                      setHoveredWork(item);
                      e.currentTarget.querySelector('video')?.play().catch(() => {});
                    }}
                    onMouseLeave={e => {
                      setHoveredWork(null);
                      const v = e.currentTarget.querySelector('video');
                      if (v) v.pause();
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumb} alt={item.title} loading="lazy" className="w-full aspect-video object-cover" />
                    {item.preview && (
                      <video
                        src={item.preview}
                        muted
                        loop
                        playsInline
                        preload="none"
                        className="absolute inset-0 w-full aspect-video object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                      <span className="text-sm opacity-70">{item.subtitle}</span>
                      <span className="font-semibold">{item.title}</span>
                      {item.video && <span className="mt-1 text-xs opacity-60">▶ watch</span>}
                      {!item.video && item.detail && <span className="mt-1 text-xs opacity-60">read more →</span>}
                    </div>
                  </div>
                ))}
              </div>
              <CTA locale={locale} />
            </div>
          )}
          {section === 'team' && (
            <>
              <Team title={team[l]?.title} subtitle={team[l]?.subtitle} locale={locale} />
              <CTA locale={locale} />
            </>
          )}
          {section === 'feed' && (
            <div className="max-w-2xl mx-auto px-6 py-16">
              <h2 className="text-3xl font-bold mb-2 page-title-anim">{feed[l]?.title}</h2>
              <p className="mb-6 opacity-70 page-title-anim page-title-anim-d1">{feed[l]?.subtitle}</p>

              {/* placeholder note */}
              <div className="mb-6 rounded-xl border border-white/15 bg-black/60 px-4 py-2 font-mono text-[11px] text-white/40 page-anim">
                {feed[l]?.placeholderNote}
              </div>

              {/* X-style feed */}
              <div className="space-y-4 page-anim page-anim-d1">
                {feedPosts.map((post, i) => (
                  <article
                    key={i}
                    className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md p-5 hover:border-amber-300/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/favicon.ico" alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-white/90">SOPA AGENCY</span>
                        <span className="ml-1.5 text-sm text-white/40">@{post.handle}</span>
                        <span className="ml-1.5 text-sm text-white/30">· {post.time}</span>
                      </div>
                      <span className="text-amber-300 text-lg">𝕏</span>
                    </div>
                    <p className="text-sm leading-relaxed text-white/85 mb-3">
                      {locale === 'pt' ? post.text.pt : post.text.en}
                    </p>
                    {post.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={post.image}
                        alt=""
                        loading="lazy"
                        className="w-full rounded-xl border border-white/10 object-cover aspect-video mb-3"
                      />
                    )}
                    <div className="flex gap-6 font-mono text-[11px] text-white/40">
                      <span>♡ {post.likes}</span>
                      <span>⇄ {post.reposts}</span>
                    </div>
                  </article>
                ))}
              </div>

              {/* follow CTA */}
              <div className="mt-8 text-center page-anim">
                <a
                  href="https://x.com/sopaagency"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_25px_rgba(255,204,0,0.3)] hover:shadow-[0_0_40px_rgba(255,204,0,0.5)] transition-all cursor-pointer"
                >
                  {feed[l]?.follow}
                </a>
              </div>

              <CTA locale={locale} />
            </div>
          )}
          {section === 'solutions' && (
            <>
              <Solutions title={ex.solutions.title} locale={locale} />
              <Process locale={locale} />
              <CTA locale={locale} />
            </>
          )}
                  {section === 'about' && (
                    <>
                      <About locale={locale} />
                      <CTA locale={locale} />
                    </>
                  )}
                  {section === 'contact' && <Contact title={ex.contact.title} locale={locale} />}
        </div>
      </main>

      {section !== 'home' && (
        <Footer locale={locale} />
      )}

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} locale={locale} onNavigate={navigate} />
      <TransitionOverlay hidden={!isHome} />
      <Showreel videoUrl={reelUrl} onClose={() => setReelUrl(null)} />
      <WorkDetail item={detailItem} onClose={() => setDetailItem(null)} />
      {/* grouped bottom-right switchers: [HUMAN|MACHINE] [Aa theme] [EN|PT] */}
      <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2">
        <HumanMachineSwitcher locale={locale} />
        <ThemeSwitcher />
        <LocaleSwitcher />
      </div>
    </>
  );
}