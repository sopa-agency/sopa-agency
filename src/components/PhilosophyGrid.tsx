// src/components/PhilosophyGrid.tsx
// Philosophy states as interactive micro-cards grid
'use client';
import { useInView } from '@/hooks/useInView';

const PHILOSOPHY_ITEMS = [
  { id: 1, title: "FROM AN IDEA" },
  { id: 2, title: "GIVE IT SHAPE" },
  { id: 3, title: "CREATE TRENDS" },
  { id: 4, title: "LET IT MORPH" },
  { id: 5, title: "EYES ON RESULTS" },
  { id: 6, title: "POWERED BY AI" },
  { id: 7, title: "KEEP LEARNING" },
  { id: 8, title: "WORK AS A TEAM" },
];

export default function PhilosophyGrid({ className = '' }: { className?: string }) {
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    <section className={`relative py-20 ${className}`}>
      <div ref={ref} className={`max-w-7xl mx-auto px-6 ${inView ? 'animate-scroll-fade-in-up' : ''}`}>
        <h2 className="text-3xl font-bold mb-12 text-center page-title-anim">
          Core Philosophy
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 page-anim page-anim-d1">
          {PHILOSOPHY_ITEMS.map((item) => (
            <div
              key={item.id}
              className="group relative flex items-center justify-center min-h-[80px] rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm transition-all duration-500 hover:bg-black/60 hover:border-white/30"
            >
              <span className="text-sm font-medium text-white/90 tracking-wider uppercase">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}