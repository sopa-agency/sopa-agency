import { useEffect, useRef } from 'react'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** Fração do track em que o card termina de fechar as bordas. */
const CLOSE_AT = 0.3
/**
 * Trecho em que a moldura do hero — o bloco do canto, os botões, a dica de
 * scroll — desaparece. Começa quase em zero e dura pouco: um empurrãozinho de
 * scroll basta para limpar a cena e deixar só a palavra no centro. É também o
 * que tira o texto do canto do caminho antes de a narrativa passar por ali.
 */
const CHROME_FADE = { start: 0.005, length: 0.05 }
/**
 * Trecho em que a palavra gigante desaparece. Vem depois da moldura, e não
 * junto: entre uma coisa e outra existe um respiro em que o card está com a
 * palavra sozinha no meio — é o retrato da marca, e ele precisa de um tempo
 * em que nada mais esteja acontecendo. Termina antes de o primeiro parágrafo
 * alcançar o centro da tela.
 */
const WORDMARK_FADE = { start: 0.1, length: 0.12 }
/**
 * Trecho em que o feixe de luz se abre e sai de cena. Anda junto com a moldura
 * — é o mesmo empurrão de scroll —, só que um pouco mais longo: o rasgo precisa
 * de alguns frames a mais que um fade para ser lido como um evento, e não como
 * algo que simplesmente apagou. No fim dele o card está limpo, e a narrativa
 * passa sobre o gradiente puro.
 */
const BEAM_OPEN = { start: 0, length: 0.14 }
/** Trecho em que o texto atravessa o card. */
const STORY = { start: 0.04, length: 0.9 }
/**
 * A zona de leitura, em frações da altura da janela — 0 no topo, 1 no pé. São
 * três faixas, e elas fazem coisas diferentes de propósito.
 *
 * `APPEAR` é larga: a linha surge, apagada, ainda lá embaixo. É o que impede o
 * pé do card de ficar vazio — card vazio no meio de um scroll longo lê como fim
 * de página, e a pessoa para de rolar.
 *
 * `WIPE` é estreita: é o facho que acende a linha da esquerda para a direita,
 * na altura em que se lê. Estreita porque o cursor mora na ponta do facho, e
 * numa faixa larga cinco linhas estariam sendo varridas ao mesmo tempo — cinco
 * cursores piscando, o que terminal nenhum faz.
 *
 * `FADE` é a saída: da altura do olho para cima a linha vai apagando até
 * `READ_DIM`, e não até zero. O que já foi lido continua ali, fraco, como
 * scrollback — some porque sai da tela, não porque apagou.
 */
const APPEAR = { start: 0.98, end: 0.72 }
const WIPE = { start: 0.6, end: 0.55 }
const FADE = { start: 0.06, end: 0.30 }
const READ_DIM = 0.14
/** Onde a última linha assenta quando o progresso chega a 1. */
const LAST_LINE_AT = 0.44
/**
 * Telas do fim do track em que o hero fica PARADO enquanto a seção seguinte
 * sobe por cima dele. Ficam fora da conta do progresso, junto com o HOLD
 * abaixo: `--p` chega a 1 antes de qualquer uma das duas começar.
 *
 * Foi 1 tela inteira e encurtou. O card fica congelado durante ela — texto
 * parado, feixe já embora — e uma tela cheia disso lê como fim de página: a
 * pessoa para de rolar antes dos serviços. Com 0,4 o hero solta a fixação
 * cedo e volta a deslizar junto com a seção que sobe, e a cena nunca fica sem
 * nada se mexendo.
 *
 * **Anda casado com a margem negativa do `Services`** (`-mt-[40vh]`): é a
 * mesma sobreposição vista de dois lugares. Mexeu num, mexa no outro, senão o
 * progresso termina em hora diferente da que a cortina começa.
 *
 * Quem mexer nestes dois números precisa somar o mesmo tanto na altura do
 * track (`Hero.tsx`): ela é 240vh + (CURTAIN + HOLD) × 100vh.
 */
const CURTAIN = 0.4
/**
 * Respiro entre o fim da narrativa e o começo da cortina, em telas. O último
 * parágrafo termina centralizado quando o progresso chega a 1; sem esta folga
 * ele era coberto no mesmo instante em que assentava. É só o que basta para
 * assentar: era 0,3 e virava espera.
 */
const HOLD = 0.1

/**
 * Todo o comportamento de scroll do hero, num único loop de animação:
 *
 * 1. **bordas fecham** — `--p` (0→1) no track, de onde o padding e o
 *    border-radius do card derivam; com lerp, para assentar macio ao parar.
 * 2. **a cena se limpa em dois tempos** — `--hc` (1→0) tira a moldura logo no
 *    primeiro empurrão de scroll e `--hw` (1→0) apaga a palavra gigante um
 *    pouco depois, deixando entre as duas um instante só com a marca. No mesmo
 *    empurrão o feixe se abre (`beamRef`, 0→1) e sai de cena.
 *
 *    O feixe é o único que não sai por variável CSS: quem o desenha é um
 *    shader, e um uniform não se alimenta de `--var`. Ler a variável de volta
 *    com `getComputedStyle` custaria um cálculo de estilo por frame, então o
 *    valor viaja num ref que o `LightBeam` lê no loop dele.
 * 3. **texto atravessa** — o bloco de texto sobe de baixo para cima por
 *    dentro do card fixo; o feixe fica parado, daí o parallax.
 * 4. **leitura** — cada LINHA surge apagada lá embaixo, é acesa da esquerda
 *    para a direita por um facho na altura do olho, com o cursor na ponta
 *    dele, e vai apagando ao sair por cima.
 *
 * Tudo é lido da posição de scroll a cada frame, então o efeito acompanha a
 * rolagem nos dois sentidos.
 */
export function useHeroScroll() {
  const trackRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef(0)
  /** As linhas da narrativa, colhidas do DOM no primeiro frame: são sempre as
   *  mesmas, e reconsultar o seletor a cada frame seria trabalho à toa. */
  const lineCache = useRef<HTMLElement[] | null>(null)

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
      const viewport = window.innerHeight

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

      // 3) texto atravessa o card
      const story = storyRef.current
      if (story) {
        const lines =
          lineCache.current ??
          (lineCache.current = Array.from(story.querySelectorAll<HTMLElement>('[data-line]')))

        const storyProgress = clamp((progress - STORY.start) / STORY.length, 0, 1)

        // A distância percorrida é calculada para que a ÚLTIMA LINHA assente na
        // altura de leitura, e não passe direto por cima: sem isso o card fica
        // vazio no fim do track.
        const last = lines[lines.length - 1]
        const travel =
          viewport * (1 - LAST_LINE_AT) + story.offsetHeight - (last?.offsetHeight ?? 0) / 2
        const y = viewport * 0.5 - storyProgress * travel
        story.style.transform = `translate(-50%, ${y.toFixed(1)}px)`

        // 4) impressão linha a linha
        //
        // Duas passadas, e não uma: escrever estilo entre duas leituras de
        // `getBoundingClientRect` invalida o layout e faz o navegador recalcular
        // tudo de novo a cada linha. Lendo todas antes de escrever qualquer
        // uma, é um cálculo só para as vinte.
        const centers = lines.map((el) => {
          const box = el.getBoundingClientRect()
          return (box.top + box.height / 2) / viewport
        })

        for (let i = 0; i < lines.length; i++) {
          const yf = centers[i]
          const appear = clamp((APPEAR.start - yf) / (APPEAR.start - APPEAR.end), 0, 1)
          const typed = clamp((WIPE.start - yf) / (WIPE.start - WIPE.end), 0, 1)
          const leaving = clamp((yf - FADE.start) / (FADE.end - FADE.start), 0, 1)
          const line = lines[i]

          line.style.setProperty('--typed', typed.toFixed(3))
          line.style.opacity = (
            appear *
            (READ_DIM + (1 - READ_DIM) * easeOutCubic(leaving))
          ).toFixed(3)
          // o cursor só existe enquanto o facho está atravessando a linha:
          // parado no fim de uma linha já acesa, ele viraria adorno
          line.style.setProperty('--caret', typed > 0.004 && typed < 0.996 ? '1' : '0')
        }
      }

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

  return { trackRef, contentRef, storyRef, beamRef }
}
