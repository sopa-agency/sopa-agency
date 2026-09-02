// src/components/WorksSolutionsGrid.tsx
// 3-column grid showcasing SOPA's services and focus areas
'use client';
import { useInView } from '@/hooks/useInView';

const WORKS_DATA = [
  {
    id: 1,
    title: "Culture & Brands",
    description: "Bridging classic culture with emerging trends to build iconic digital presences.",
  },
  {
    id: 2,
    title: "AI & Agents",
    description: "Integrating AI workflows and intelligent autonomous agents into modern web systems.",
  },
  {
    id: 3,
    title: "Onchain Systems",
    description: "Building permissionless, decentralized infrastructure from Base to the wider onchain world.",
  },
];

export default function WorksSolutionsGrid({ className = '' }: { className?: string }) {
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    <section className={`relative py-20 ${className}`}>
      <div ref={ref} className={`max-w-7xl mx-auto px-6 ${inView ? 'animate-scroll-fade-in-up' : ''}`}>
        <h2 className="text-3xl font-bold mb-12 text-center page-title-anim">
          Works & Solutions
        </h2>
        <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-3 page-anim page-anim-d1">
          {WORKS_DATA.map((work) => (
            <div
              key={work.id}
              className="group relative flex flex-col items-center justify-center rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-8 text-center transition-all duration-500 hover:bg-black/60 hover:border-white/30"
            >
              <h3 className="text-xl font-semibold mb-4 text-white">{work.title}</h3>
              <p className="text-sm text-white/80 leading-relaxed">{work.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}