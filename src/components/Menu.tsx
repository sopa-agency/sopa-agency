import { useEffect, useState } from 'react'

import { Icon } from './Icon'
import { nav } from '../data/content'

/**
 * Menu do canto superior direito: quatro pontos que, ao abrir, convergem para
 * um só — o mesmo botão fecha o que abriu, e o desenho conta isso.
 *
 * A tela cheia é de propósito. O site é uma sequência conduzida por scroll, com
 * o hero preso e a seção seguinte subindo por cima; um menu suspenso por cima
 * disso brigaria com o que está se movendo atrás. Cobrindo tudo, a navegação
 * vira uma pausa na cena em vez de um adereço.
 */

/** Posição de cada ponto fechado, em porcentagem do quadrado que os contém. */
const DOTS = [
  { top: '16%', left: '16%' },
  { top: '16%', left: '84%' },
  { top: '84%', left: '16%' },
  { top: '84%', left: '84%' },
]

export function Menu() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    // com o menu aberto a página não rola atrás — o hero é dirigido por scroll
    // e continuaria avançando embaixo do menu
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="menu"
        aria-label={isOpen ? nav.close : nav.open}
        className="fixed right-5 top-5 z-50 flex size-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-surface-raised/80 backdrop-blur-md transition-colors hover:border-white/25 sm:right-7 sm:top-7"
      >
        <span className="relative block size-[18px]">
          {DOTS.map((dot, i) => (
            <span
              key={i}
              className={`absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink transition-all duration-300 ease-out ${
                // ao abrir, todos caminham para o centro e três se apagam:
                // sobra um ponto, que é o botão de fechar
                isOpen ? 'opacity-0 first:opacity-100' : ''
              }`}
              style={isOpen ? { top: '50%', left: '50%' } : dot}
            />
          ))}
        </span>
      </button>

      <div
        id="menu"
        inert={!isOpen}
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-10 bg-frame/95 px-6 backdrop-blur-xl transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav>
          <ul className="flex flex-col items-center gap-3 text-center">
            {nav.links.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  // cada linha sobe um pouco depois da anterior enquanto o menu
                  // abre; fechado, todas descansam deslocadas para baixo
                  style={{ transitionDelay: isOpen ? `${80 + i * 55}ms` : '0ms' }}
                  className={`block font-display text-[clamp(30px,6vw,52px)] font-medium leading-tight text-ink-bright transition-all duration-500 hover:text-accent-mint ${
                    isOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Link comum, e não o `SpecularButton`: o contorno especular abre um
            contexto WebGL por botão, e este viveria montado o tempo todo atrás
            do menu fechado, gastando GPU sem nunca ser visto. */}
        <a
          href={nav.cta.href}
          target="_blank"
          rel="noreferrer"
          onClick={() => setIsOpen(false)}
          style={{ transitionDelay: isOpen ? '320ms' : '0ms' }}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-surface-raised px-6 py-3 text-sm text-ink transition-all duration-500 hover:border-white/25 ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          <Icon name="whatsapp" className="size-4" />
          {nav.cta.label}
        </a>

        {/* MAQUETE — idioma e tema ainda não fazem nada, e por isso vão
            `disabled`: botão que parece funcionar e não funciona é pior que
            botão nenhum. Ligar exige o site escrito em inglês e uma paleta
            clara desenhada; até lá, servem para ver a forma. */}
        <div
          style={{ transitionDelay: isOpen ? '380ms' : '0ms' }}
          className={`flex items-center gap-3 transition-all duration-500 ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          <div className="flex items-center rounded-lg border border-white/8 bg-white/2 p-1">
            {nav.settings.languages.map((language, i) => (
              <button
                key={language.code}
                type="button"
                disabled
                className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  i === 0 ? 'bg-white/8 text-ink' : 'text-ink/35'
                }`}
              >
                {language.label}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-lg border border-white/8 bg-white/2 p-1">
            <button
              type="button"
              disabled
              aria-label={nav.settings.theme.dark}
              className="flex size-8 items-center justify-center rounded-md bg-white/8 text-ink"
            >
              <Icon name="moon" className="size-4" />
            </button>
            <button
              type="button"
              disabled
              aria-label={nav.settings.theme.light}
              className="flex size-8 items-center justify-center rounded-md text-ink/35"
            >
              <Icon name="sun" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
