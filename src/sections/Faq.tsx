import { useState } from 'react'

import { Icon, type IconName } from '../components/Icon'
import { SectionHeading } from '../components/SectionHeading'
import { faq } from '../data/content'

/**
 * Acordeão em pills: um item aberto por vez. Fechado, cada pill mostra ícone,
 * pergunta e chevron; aberto, a resposta cresce via `grid-template-rows`.
 */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="relative bg-frame px-6 py-28 sm:px-10 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={faq.eyebrow}
          title={faq.title}
          description={faq.description}
          align="center"
        />

        <ul className="mx-auto mt-16 flex max-w-xl flex-col gap-2.5">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <li
                key={item.question}
                className={`overflow-hidden rounded-xl transition-colors ${
                  isOpen ? 'bg-white/6' : 'bg-white/4 hover:bg-white/6'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left"
                >
                  <Icon
                    name={item.icon as IconName}
                    className="size-[18px] shrink-0 text-accent-mint"
                  />
                  <span className="flex-1 text-[13px] leading-snug text-ink/85">
                    {item.question}
                  </span>
                  <Icon
                    name="chevron"
                    className={`size-4 shrink-0 text-ink/35 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 pl-[54px] text-[13px] leading-relaxed text-ink/45">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
