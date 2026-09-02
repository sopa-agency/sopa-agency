// src/components/AboutNetwork.tsx
// About & Network section: explains SOPA's human-machine collective identity
'use client';
import { useInView } from '@/hooks/useInView';

export default function AboutNetwork({ locale, className = '' }: { locale: string; className?: string }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const t = locale === 'pt' ? {
    keyText: 'Do clássico ao onchain, do humano ao agente, entregamos em ambos.',
    badge: 'HUMANO / MÁQUINA',
    network: 'rede de criadores · feito coletivamente',
    emoji: ''
  } : {
    keyText: 'From classic to onchain, human to agent, we ship in both.',
    badge: 'HUMAN / MACHINE',
    network: 'creator network · made collectively',
    emoji: ''
  };

  return (
    <section className={`relative py-24 flex items-center justify-center ${className}`}>
      <div ref={ref} className={`w-full max-w-5xl mx-auto px-6 text-center ${inView ? 'animate-scroll-fade-in-up' : ''}`}>
        
        {/* Glassmorphism Card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-10 md:p-16 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] group hover:bg-white/[0.04] transition-colors duration-700">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-amber-500/5 to-transparent blur-[120px] rounded-full pointer-events-none group-hover:from-amber-500/10 transition-colors duration-1000" />
          
          {/* Glass Noise Texture (Optional visual texture) */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/assets/noise.png")' }} />

          <div className="relative z-10">
            {/* Pill Badge */}
            <div className="mb-8 inline-flex items-center justify-center rounded-full border border-white/15 bg-black/40 px-5 py-2 shadow-inner backdrop-blur-md">
              <span className="bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent font-bold tracking-[0.2em] text-xs">
                {t.badge}
              </span>
            </div>
            
            {/* Main Statement */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium leading-[1.15] text-white/90 mb-6 max-w-3xl mx-auto">
              {t.keyText}
              <span className="inline-block ml-3 transform hover:scale-110 hover:rotate-6 transition-transform duration-300">
                {t.emoji}
              </span>
            </h2>
            
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-8" />
            
            {/* Footer Text */}
            <div className="flex items-center justify-center gap-4 text-xs md:text-sm text-white/50 uppercase tracking-[0.15em] font-mono">
              <span className="hidden sm:block w-12 h-[1px] bg-white/10"></span>
              {t.network}
              <span className="hidden sm:block w-12 h-[1px] bg-white/10"></span>
            </div>
          </div>
          
          {/* Edge Highlights */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-black/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}