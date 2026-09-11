import { useEffect, useRef } from 'react'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** Fração do track em que o card termina de fechar as bordas. */
const CLOSE_AT = 0.18
/**
 * Trecho em que a moldura do hero — o bloco do canto, os botões, a dica de
 * scroll — desaparece. Começa quase em zero e dura pouco: um empurrãozinho de
 * scroll basta para limpar a cena e deixar só a palavra no centro. É também o
 * que tira o texto do canto do caminho antes de a narrativa passar por ali.
 */
const CHROME_FADE = { start: 0.008, length: 0.05 }
/**
 * Trecho em que a palavra gigante desaparece. Vem depois da moldura, e não
 * junto: entre uma coisa e outra existe um respiro em que o card está com a
 * palavra sozinha no meio — é o retrato da marca, e ele precisa de um tempo
 * em que nada mais esteja acontecendo. Termina antes de o primeiro parágrafo
 * alcançar o centro da tela.
 */
const WORDMARK_FADE = { start: 0.08, length: 0.12 }
/**
 * Trecho em que o feixe de luz se abre e sai de cena. Começa no instante em que
 * o card da seção 02 encosta no pé da tela e dura enquanto ele sobe: o rasgo
 * acontece na faixa de hero que ainda sobra ACIMA do card, que vai encolhendo.
 * A luz se abre e o card entra por dentro dela.
 *
 * Já foi o primeiro ato (`{ start: 0, length: 0.14 }`, junto da moldura) e
 * depois o último (`{ 0.55, 0.45 }`). No primeiro, a narrativa passava logo
 * atrás e havia o que ver; sem ela, rasgar cedo deixava o resto do track sem
 * nada. No segundo, o rasgo terminava e o hero ficava parado e vazio quase mil
 * pixels enquanto o card subia — que é o buraco que este ajuste fecha.
 */
const BEAM_OPEN = { start: 0.36, length: 0.5 }
/**
 * Todo o comportamento de scroll do hero, num único loop de animação:
 *
 * 1. **bordas fecham** — `--p` (0→1) no track, de onde o padding e o
 *    border-radius do card derivam; com lerp, para assentar macio ao parar.
 * 2. **a cena se limpa em três tempos** — `--hc` (1→0) tira a moldura logo no
 *    primeiro empurrão de scroll, `--hw` (1→0) apaga a palavra gigante um pouco
 *    depois, e o feixe se rasga (`beamRef`, 0→1) por último, JUNTO com a subida
 *    do card da seção 02. A ordem importa: a luz se abre e o card entra por
 *    dentro dela, em vez de o hero ficar parado e vazio esperando.
 *
 *    O feixe é o único que não sai por variável CSS: quem o desenha é um
 *    shader, e um uniform não se alimenta de `--var`. Ler a variável de volta
 *    com `getComputedStyle` custaria um cálculo de estilo por frame, então o
 *    valor viaja num ref que o `LightBeam` lê no loop dele.
 * A narrativa que atravessava o card saiu daqui: virou a seção 02
 * (`sections/Metodo.tsx`), que é texto parado com um painel ao lado. O hero
 * passou a ocupar uma tela, e as faixas abaixo foram reescalonadas para caber
 * no track curto que sobrou.
 *
 * Tudo é lido da posição de scroll a cada frame, então o efeito acompanha a
 * rolagem nos dois sentidos.
 */
export function useHeroScroll() {
  const trackRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let closeCurrent = 0
    let raf = 0
    let visible = true

    const tick = () => {
      if (!visible) {
        raf = 0
        return
      }

      const rect = track.getBoundingClientRect()
      // Toda a vida presa do hero: ele fica fixo do topo do track até faltar
      // uma tela para o fim dele. Espalhar a coreografia por esse intervalo
      // inteiro é o que evita hero parado e vazio enquanto o card sobe.
      const distance = track.offsetHeight - window.innerHeight
      const progress = distance > 0 ? clamp(-rect.top / distance, 0, 1) : 0

      // 1) bordas fecham
      const closeTarget = easeOutCubic(clamp(progress / CLOSE_AT, 0, 1))
      closeCurrent += (closeTarget - closeCurrent) * 0.12
      if (Math.abs(closeTarget - closeCurrent) < 0.001) closeCurrent = closeTarget
      track.style.setProperty('--p', closeCurrent.toFixed(4))

      // 2) a cena se limpa em dois tempos
      // as duas no track, e não em cada bloco: o canto, os botões e a dica
      // ficam em cantos opostos do card e herdam o mesmo valor daqui, sem
      // precisar de uma conta por elemento
      const chrome = 1 - clamp((progress - CHROME_FADE.start) / CHROME_FADE.length, 0, 1)
      track.style.setProperty('--hc', chrome.toFixed(3))

      const wordmark = 1 - clamp((progress - WORDMARK_FADE.start) / WORDMARK_FADE.length, 0, 1)
      track.style.setProperty('--hw', wordmark.toFixed(3))

      // sobe de 0 a 1, e não o contrário: aqui 1 é "já foi embora"
      beamRef.current = clamp((progress - BEAM_OPEN.start) / BEAM_OPEN.length, 0, 1)

      const content = contentRef.current
      // depois de sumir, para de interceptar cliques nos botões
      if (content) content.style.pointerEvents = chrome < 0.02 ? 'none' : ''

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    /** Com o hero fora da tela não há o que recalcular — e este loop lê o
     *  layout a cada frame, para o bloco e para cada parágrafo. Ao voltar, o
     *  primeiro tick refaz tudo a partir da posição de scroll atual. */
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(tick)
      },
      { rootMargin: '120px' },
    )
    visibility.observe(track)

    return () => {
      cancelAnimationFrame(raf)
      visibility.disconnect()
    }
  }, [])

  return { trackRef, contentRef, beamRef }
}
