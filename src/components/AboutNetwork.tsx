// src/components/AboutNetwork.tsx
// About & Network section: explains SOPA's human-machine collective identity
'use client';
import { useInView } from '@/hooks/useInView';

export default function AboutNetwork({ locale, className = '' }: { locale: string; className?: string }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const t = locale === 'pt' ? {
    keyText: 'Do clássico ao onchain, do humano ao agente — enviamos nos dois. 🛹⚡',
    badge: 'HUMANO MÁQUINA',
    network: 'rede de criadores · feito coletivamente'
  } : {
    keyText: 'From classic to onchain, human to agent — we ship in both. 🛹⚡',
    badge: 'HUMAN MACHINE',
    network: 'creator network · made collectively'
  };

  return (
    <section className={`relative py-20 ${className}`}>
      <div ref={ref} className={`max-w-4xl mx-auto px-6 text-center ${inView ? 'animate-scroll-fade-in-up' : ''}`}>
        <p className="text-sm md:text-base font-medium text-white/80 mb-6">
          {t.keyText}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <span className="rounded-xl border border-white/20 bg-black/40 px-3 py-1 backdrop-blur-sm">
            {t.badge}
          </span>
          <span className="text-white/60">
            {t.network}
          </span>
        </div>
      </div>
    </section>
  );
}