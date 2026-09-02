// src/components/WorksSolutionsGrid.tsx
// Home page section: 3-column grid showcasing SOPA's services and focus areas.
'use client';
import { useInView } from '@/hooks/useInView';
import { worksSolutions } from '@/data/worksSolutions';

export default function WorksSolutionsGrid({ locale = 'en', className = '' }: { locale?: string; className?: string }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const data = worksSolutions[locale as keyof typeof worksSolutions] || worksSolutions.en;

  return (
    <section className={`relative py-20 ${className}`}>
      <div ref={ref} className={`max-w-7xl mx-auto px-6 ${inView ? 'animate-scroll-fade-in-up' : ''}`}>
        <h2 className="font-display text-3xl font-bold mb-12 text-center page-title-anim">
          {data.title}
        </h2>
        <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-3 page-anim page-anim-d1">
          {data.items.map((item) => (
            <div
              key={item.title}
              className="group relative flex flex-col items-center justify-center rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-8 text-center transition-all duration-500 hover:bg-black/60 hover:border-white/30"
            >
              <h3 className="text-xl font-semibold mb-4 text-white">{item.title}</h3>
              <p className="text-sm text-white/80 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
