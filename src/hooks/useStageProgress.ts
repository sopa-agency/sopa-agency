import { useEffect, useRef } from 'react'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Progresso de um palco fixo, publicado em `--enter` (0 → 1).
 *
 * A diferença para o `useEnterProgress` é ONDE o zero fica. Lá o progresso
 * conta enquanto a seção ENTRA na tela, e chega a 1 quando ela acabou de
 * chegar; aqui ele só começa quando o track encosta no topo — ou seja, quando
 * o `sticky` de dentro prende e o quadro para de se mexer. É essa diferença
 * que faz o conteúdo subir POR DENTRO de um quadro parado, em vez de subir
 * junto com ele: com o quadro em movimento não há contra o que se mover, e o
 * olho lê a rolagem da página, não uma chegada.
 *
 * É o mesmo cálculo que o `useHeroScroll` faz para o card do hero, e por isso
 * publica na mesma variável que o `useEnterProgress` — os utilitários
 * `enter-rise` e `enter-grow` consomem os dois sem saber qual é qual.
 *
 * `hold` é a fração do track reservada ao fim, em que o progresso já vale 1 e o
 * quadro fica parado com tudo no lugar. Sem ela o conteúdo termina de assentar
 * no mesmo instante em que a seção seguinte começa a cobrir, e não se chega a
 * ver a composição inteira.
 *
 * Como todo efeito de scroll daqui, lê a posição a cada frame e funciona nos
 * dois sentidos. Com movimento reduzido no sistema o palco já nasce assentado.
 */
export function useStageProgress(hold = 0.35) {
  const trackRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.style.setProperty('--enter', '1')
      return
    }

    let raf = 0
    let visible = true

    const tick = () => {
      if (!visible) {
        raf = 0
        return
      }

      const viewport = window.innerHeight
      // o que o track ainda rola DEPOIS de prender: a altura dele menos a tela
      // que o `sticky` ocupa, menos a folga do fim
      const preso = (track.offsetHeight - viewport) * (1 - hold)
      const { top } = track.getBoundingClientRect()

      // O percurso começa quando o topo do track encosta no pé da tela e
      // termina lá dentro, com o quadro já preso. Contar só a partir do
      // instante de prender deixava o quadro subir VAZIO uma tela inteira
      // antes de qualquer coisa acontecer; contar só até prender devolvia o
      // problema anterior, de o conteúdo andar junto com a página. Pegando os
      // dois trechos, o conteúdo aparece subindo enquanto o quadro chega e
      // termina de assentar depois que ele para — que é a leitura certa.
      // o piso protege a divisão: no celular não há palco preso e `preso` sai
      // negativo, o que é só o caso degenerado de um percurso sem a parte de
      // dentro do quadro
      const percurso = Math.max(viewport * 0.5, viewport + preso)
      const progress = clamp((viewport - top) / percurso, 0, 1)
      track.style.setProperty('--enter', easeOutCubic(progress).toFixed(4))

      raf = requestAnimationFrame(tick)
    }

    /** Longe da tela não há o que calcular; o último valor escrito fica de pé. */
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(tick)
      },
      { rootMargin: '200px' },
    )
    visibility.observe(track)

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      visibility.disconnect()
    }
  }, [hold])

  return trackRef
}
