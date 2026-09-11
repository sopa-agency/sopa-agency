import { useEffect, useRef } from 'react'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** Fração do track em que o card termina de fechar as bordas. */
const CLOSE_AT = 0.55
/**
 * Trecho em que a moldura do hero — o bloco do canto, os botões, a dica de
 * scroll — desaparece. Começa quase em zero e dura pouco: um empurrãozinho de
 * scroll basta para limpar a cena e deixar só a palavra no centro. É também o
 * que tira o texto do canto do caminho antes de a narrativa passar por ali.
 */
const CHROME_FADE = { start: 0.02, length: 0.15 }
/**
 * Trecho em que a palavra gigante desaparece. Vem depois da moldura, e não
 * junto: entre uma coisa e outra existe um respiro em que o card está com a
 * palavra sozinha no meio — é o retrato da marca, e ele precisa de um tempo
 * em que nada mais esteja acontecendo. Termina antes de o primeiro parágrafo
 * alcançar o centro da tela.
 */
const WORDMARK_FADE = { start: 0.25, length: 0.35 }
/**
 * Trecho em que o feixe de luz se abre e sai de cena. É o ÚLTIMO ato do hero, e
 * de propósito: ele termina de rasgar no instante em que a seção 02 começa a
 * subir, então o rasgo deixa de ser um fim e vira a abertura que entrega a
 * seção seguinte. É daí que vem a sensação de as duas telas estarem coladas.
 *
 * Já foi o primeiro ato (`{ start: 0, length: 0.14 }`, junto da moldura). Ali
 * ele fazia sentido porque a narrativa começava a passar logo atrás e havia o
 * que ver; hoje, com a narrativa fora do card, rasgar cedo deixava o resto do
 * track sem nada acontecendo.
 */
const BEAM_OPEN = { start: 0.55, length: 0.45 }
/**
 * Telas do fim do track em que o hero fica PARADO enquanto a seção seguinte
 * sobe por cima dele. Ficam fora da conta do progresso, junto com o HOLD
 * abaixo: `--p` chega a 1 antes de qualquer uma das duas começar.
 *
 * Foi 1 tela, depois 0,4, e agora é 0,7 — e o número não é estético, é o que
 * decide QUANDO a seção seguinte aparece. A conta:
 *
 *   distância        D = track − tela × (1 + CURTAIN + HOLD)
 *   a seção aparece em  D + tela × HOLD
 *
 * Ou seja: quanto maior o CURTAIN, mais cedo ela chega. Com 0,4 a
 * coreografia terminava e sobravam ~700px de preto vazio antes de a seção
 * entrar — a pessoa rolava meia tela sem nada acontecendo, que é o defeito
 * que a narrativa antiga não tinha (ela começava a subir em 4% do progresso,
 * com o feixe ainda rasgando). Com 0,7 a seção começa a aparecer 36px depois
 * de o card terminar de fechar: o feixe rasga, a palavra apaga, o card
 * assenta e a seção sobe, sem buraco entre uma coisa e outra.
 *
 * **Anda casado com a margem negativa do `Services`** (`-mt-[40vh]`): é a
 * mesma sobreposição vista de dois lugares. Mexeu num, mexa no outro, senão o
 * progresso termina em hora diferente da que a cortina começa.
 *
 * Quem mexer nestes dois números precisa somar o mesmo tanto na altura do
 * track (`Hero.tsx`): ela é 35vh + (CURTAIN + HOLD) × 100vh = 210vh.
 *
 * Os 60vh são o que sobrou depois de a narrativa virar seção própria: eram
 * 240vh, e o hero só precisa do bastante para o card fechar, a palavra
 * apagar e o feixe se rasgar. Por isso as faixas lá em cima foram
 * multiplicadas por ~3 — no track antigo elas terminavam nos primeiros 30%
 * e o resto virava scroll morto.
 */
const CURTAIN = 0.7
/**
 * Respiro entre o fim da coreografia e a chegada da seção seguinte, em telas.
 * Sem ele o card seria coberto no mesmo instante em que termina de fechar.
 * 0,05 dá ~45px: o bastante para assentar, pouco para virar espera. Era 0,3,
 * depois 0,1, e encolheu junto com o track.
 */
const HOLD = 0.05

/**
 * Todo o comportamento de scroll do hero, num único loop de animação:
 *
 * 1. **bordas fecham** — `--p` (0→1) no track, de onde o padding e o
 *    border-radius do card derivam; com lerp, para assentar macio ao parar.
 * 2. **a cena se limpa em três tempos** — `--hc` (1→0) tira a moldura logo no
 *    primeiro empurrão de scroll, `--hw` (1→0) apaga a palavra gigante um pouco
 *    depois, e só então o feixe se rasga (`beamRef`, 0→1). A ordem importa: o
 *    rasgo é o último ato, e termina quando a seção 02 começa a subir.
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
      const distance = track.offsetHeight - window.innerHeight * (1 + CURTAIN + HOLD)
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
