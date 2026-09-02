// src/components/ContactActionCenter.tsx
// Contact & Action Center: CTA button and network links grid
'use client';
import CTA from '@/components/CTA';
import { useInView } from '@/hooks/useInView';

export default function ContactActionCenter({ locale, className = '' }: { locale: string; className?: string }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const links = [
    { name: 'Farcaster', url: 'https://warpcast.com/~/channel/gnars', icon: '⚡' },
    { name: 'Instagram', url: 'https://www.instagram.com/sopa_agency/', icon: '📸' },
    { name: 'GitHub', url: 'https://github.com/sopa-agency', icon: '🐙' },
    { name: 'Email', url: 'mailto:crew@sopa.team', icon: '✉️' }
  ];

  return (
    <section className={`relative py-20 ${className}`}>
      <div ref={ref} className={`max-w-4xl mx-auto px-6 ${inView ? 'animate-scroll-fade-in-up' : ''}`}>
        {/* CTA Box */}
        <CTA
          title="Your next big idea starts here. Let's make it real! Ready to start? Let's talk about your project."
          subtitle={locale === 'pt' ? 'Vamos conversar sobre seu projeto. A primeira conversa é grátis.' : "Let's talk about your project."}
          button={locale === 'pt' ? 'AGENDAR CONVERSA' : 'BOOK DISCOVERY CALL'}
          href="/contact"
          locale={locale}
        />

        {/* Network Links Grid */}
        <div className="mt-16">
          <h3 className={locale === 'pt' ? 'text-lg font-semibold mb-4 text-center' : 'text-lg font-semibold mb-4 text-center'}>
            {locale === 'pt' ? 'Conectar / Rede' : 'Connect / Network'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center justify-center p-4 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm transition-all duration-500 hover:bg-black/60 hover:border-white/30"
              >
                <span className="text-xl mb-2">{link.icon}</span>
                <span className="text-sm text-white/80">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}