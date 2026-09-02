// src/components/PhilosophyGrid.tsx
'use client';
import { useInView } from '@/hooks/useInView';
import { philosophy } from '@/data/philosophy';

export default function PhilosophyGrid({ locale = 'en', className = '' }: { locale?: string, className?: string }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const data = philosophy[locale as keyof typeof philosophy] || philosophy.en;

  return (
    <section className={`relative py-24 flex items-center ${className}`}>
      <div ref={ref} className={`w-full max-w-7xl mx-auto px-6 ${inView ? 'animate-scroll-fade-in-up' : ''}`}>
        
        {/* Header */}
        <div className="mb-16 md:w-2/3">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 page-title-anim">
            {data.title}
          </h2>
          <p className="text-lg md:text-xl opacity-70 page-title-anim page-title-anim-d1">
            {data.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 lg:grid-cols-3 mb-16 page-anim page-anim-d1">
          {data.steps.map((step, index) => (
            <div key={index} className="flex flex-col border-t border-white/20 pt-6">
              <div className="text-sm font-medium text-amber-300 mb-4">{step.num}</div>
              <h3 className="text-2xl font-semibold mb-3">
                {step.title}
              </h3>
              <p className="opacity-70 mb-6 flex-grow">
                {step.description}
              </p>
              <div className="text-xs font-mono opacity-50 tracking-wider">
                {step.tags}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border border-white/20 bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between page-anim page-anim-d2">
          <div className="md:w-2/3">
            <h3 className="text-2xl font-bold mb-3">{data.footerTitle}</h3>
            <p className="opacity-70 mb-4">{data.footerText}</p>
            <p className="text-amber-300 font-medium italic">"{data.tagline}"</p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-4 min-w-max">
            <button 
              onClick={() => {
                const event = new CustomEvent('sopa:navigate', { detail: 'work' });
                window.dispatchEvent(event);
              }}
              className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              {data.links.work}
            </button>
            <button 
              onClick={() => {
                const event = new CustomEvent('sopa:navigate', { detail: 'contact' });
                window.dispatchEvent(event);
              }}
              className="px-6 py-3 rounded-full bg-white text-black hover:bg-amber-300 transition-colors text-sm font-semibold"
            >
              {data.links.contact}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}