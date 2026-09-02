// src/components/ContactActionCenter.tsx
// Contact & Action Center: CTA button and network links grid
'use client';
import CTA from '@/components/CTA';
import { useInView } from '@/hooks/useInView';

export default function ContactActionCenter({ locale, className = '' }: { locale: string; className?: string }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const links = [
    { 
      name: 'Farcaster', 
      url: 'https://warpcast.com/~/channel/gnars', 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24">
          <path d="M18.24.24H5.76A5.52 5.52 0 0 0 .24 5.76v12.48a5.52 5.52 0 0 0 5.52 5.52h12.48a5.52 5.52 0 0 0 5.52-5.52V5.76a5.52 5.52 0 0 0-5.52-5.52Zm-2.88 15.6a.72.72 0 0 1-1.03.11l-2.33-1.9v4.27a.72.72 0 1 1-1.44 0v-4.27l-2.33 1.9a.72.72 0 1 1-.92-1.12l3.41-2.77H6.96a.72.72 0 1 1 0-1.44h8.88v-.48h-8.4a.72.72 0 1 1 0-1.44h8.4v-.48H5.76a.72.72 0 1 1 0-1.44h10.08v-.24c0-2.38-1.94-4.32-4.32-4.32a.72.72 0 1 1 0-1.44c3.18 0 5.76 2.58 5.76 5.76v1.92h.96a.72.72 0 1 1 0 1.44h-.96v.48h1.44a.72.72 0 1 1 0 1.44h-1.44v.48h.48a.72.72 0 1 1 0 1.44h-4.31l3.41 2.77a.72.72 0 0 1 .11 1.03Z" fill="currentColor"/>
        </svg>
      ) 
    },
    { 
      name: 'Instagram', 
      url: 'https://www.instagram.com/sopa_agency/', 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ) 
    },
    { 
      name: 'GitHub', 
      url: 'https://github.com/sopa-agency', 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ) 
    },
    { 
      name: 'Email', 
      url: 'mailto:crew@sopa.team', 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
        </svg>
      ) 
    }
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