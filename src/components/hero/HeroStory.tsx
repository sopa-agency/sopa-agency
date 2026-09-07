import type { Ref } from 'react'

import { Icon } from '../Icon'
import { SpecularButton } from '../SpecularButton'
import { hero } from '../../data/content'

/**
 * Texto que atravessa o card do hero enquanto ele fica preso na viewport.
 *
 * O bloco é posicionado em absoluto e o `useHeroScroll` reescreve o `transform`
 * a cada frame — o feixe fica parado e o texto passa por cima, daí o parallax.
 * A opacidade de cada filho também vem do hook (acende no centro da tela), por
 * isso todos começam invisíveis: cada parágrafo é um filho e acende na sua vez.
 * A capitular fica só no primeiro, que é onde o texto começa.
 *
 * Sem utilitário de translate aqui: no Tailwind v4 eles usam a propriedade
 * `translate`, que compõe com o `transform` inline em vez de substituí-lo — o
 * deslocamento em X sairia dobrado. Quem centraliza é o próprio hook.
 */
export function HeroStory({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-1/2 z-2 w-[min(620px,88%)] text-left will-change-transform md:w-[min(620px,82%)]"
      style={{ transform: 'translate(-50%, 50vh)' }}
    >
      {hero.story.paragraphs.map((text, i) => (
        <p
          key={text}
          className={`text-halo mb-[2.5vh] font-reading text-[clamp(19px,2.5vw,24px)] leading-[1.6] text-ink opacity-0 will-change-[opacity] ${
            i === 0
              ? 'first-letter:float-left first-letter:pt-1.5 first-letter:pr-2.5 first-letter:text-[3.4em] first-letter:leading-[0.8] first-letter:text-ink-bright'
              : ''
          }`}
        >
          {text}
        </p>
      ))}

      {/* margem própria: o que separa o botão do último parágrafo não pode ser
          o mesmo respiro que separa um parágrafo do outro */}
      <div className="mt-[6vh] text-center opacity-0">
        <SpecularButton
          href={hero.story.cta.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/10 bg-surface-raised px-6 py-[13px] text-[15px] text-ink hover:border-white/25"
        >
          <Icon name="whatsapp" className="size-[17px]" />
          {hero.story.cta.label}
        </SpecularButton>
      </div>
    </div>
  )
}
