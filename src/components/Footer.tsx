// src/components/Footer.tsx
// Footer: menu links (client-side nav) + socials from site data. Fades in at page bottom (parent).
'use client';
import { site } from '@/data/site';
import { withWipe } from '@/components/TransitionOverlay';
import { useRouter } from 'next/navigation';

export default function Footer({ locale }: { locale: string }) {
  const router = useRouter();
  const s = site[locale as keyof typeof site] ?? site.en;

  return (
    <footer className="relative z-20 bg-black text-white py-10">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
          {s.menu.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="text-sm hover:text-amber-300 transition-colors"
              onClick={e => {
                e.preventDefault();
                withWipe(() => router.push(`/${locale}${item.link === '/' ? '' : item.link}`));
              }}
            >
              {item.title}
            </a>
          ))}
        </nav>

        <div className="flex justify-center gap-6 mb-6">
          {(s.socials ?? []).map(soc => (
            <a key={soc.name} href={soc.url} target="_blank" rel="noreferrer" className="text-sm text-white/60 hover:text-amber-300 transition-colors">
              {soc.name}
            </a>
          ))}
        </div>

        <p className="text-center text-xs font-mono text-amber-300/80 mb-2">
          {locale === 'pt' ? 'Do clássico ao onchain, do humano ao agente — entregamos em ambos.' : 'From classic to onchain, human to agent, we ship in both.'}
        </p>

        <p className="text-center text-xs text-white/40">
          sopa © {new Date().getFullYear()} · {locale === 'pt' ? 'rede de criadores · feito coletivamente' : 'creator network · made collectively'}
        </p>
      </div>
    </footer>
  );
}
