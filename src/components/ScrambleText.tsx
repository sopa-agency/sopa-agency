import { useEffect, useRef } from 'react'

/**
 * Texto varrido por uma onda: de tempos em tempos um punhado de letras se
 * embaralha e assenta de volta, da esquerda para a direita, enquanto o resto
 * da frase segue legível. Quantas letras a onda segura ao mesmo tempo é o
 * `wave` — é ele que separa o efeito de "a palavra toda derrete".
 *
 * O que sai na tela é sempre o mesmo número de caracteres do texto final, e os
 * espaços nunca são sorteados — a palavra mantém o desenho enquanto se resolve.
 * Ainda assim, cada letra sorteada tem a largura dela: em fonte proporcional a
 * linha balançaria a cada frame, então quem usa isto passa `font-mono`.
 *
 * O texto de verdade vai junto, escondido, para leitor de tela — o embaralhado
 * é decoração e sai da árvore de acessibilidade.
 */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&$@*/<>'

const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

export function ScrambleText({
  text,
  className = '',
  /** quanto dura uma passada, do primeiro sorteio à última letra no lugar */
  duration = 2200,
  /** descanso com o texto inteiro legível, entre uma passada e a próxima */
  interval = 5000,
  /** de quanto em quanto tempo as letras ainda soltas trocam de glifo */
  churn = 45,
  /** quantas letras a onda segura embaralhadas ao mesmo tempo */
  wave = 4,
}: {
  text: string
  className?: string
  duration?: number
  interval?: number
  churn?: number
  wave?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // movimento reduzido no sistema: o texto fica parado e legível
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const chars = [...text]
    // a última letra assenta um pouco antes do fim, senão a passada parece
    // terminar depois que já não há mais nada se mexendo
    const settleAt = chars.map((_, i) => (i / chars.length) * duration * 0.82)
    // cada letra só começa a se embaralhar quando a onda chega nela, `wave`
    // posições antes de ser a vez dela de assentar — antes disso está inteira
    const stirAt = settleAt.map((at) => at - (wave * duration * 0.82) / chars.length)

    let raf = 0
    let visible = true
    let passStart = performance.now()
    let lastChurn = 0
    let frozen = ''

    const frame = (now: number) => {
      raf = 0
      if (!visible) return

      const elapsed = now - passStart

      if (elapsed > duration) {
        // descanso: nada a desenhar até a próxima passada
        el.textContent = text
        if (elapsed > duration + interval) {
          passStart = now
          lastChurn = 0
        }
        raf = requestAnimationFrame(frame)
        return
      }

      // as letras soltas só trocam de glifo a cada `churn`; a cada frame seria
      // rápido demais para o olho e ainda repintaria a linha 60 vezes por segundo
      const rolled = now - lastChurn >= churn
      if (rolled) lastChurn = now

      let out = ''
      for (let i = 0; i < chars.length; i++) {
        const char = chars[i]
        if (char === ' ' || elapsed < stirAt[i] || elapsed >= settleAt[i]) {
          out += char // a onda ainda não chegou, ou já passou
        } else if (rolled || !frozen[i]) {
          out += pick()
        } else {
          out += frozen[i]
        }
      }

      frozen = out
      el.textContent = out
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame)
    }

    /** Fora da tela não embaralha — e volta do começo quando reaparece. */
    const viewport = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          passStart = performance.now()
          lastChurn = 0
          start()
        }
      },
      { rootMargin: '80px' },
    )
    viewport.observe(el)

    start()

    return () => {
      cancelAnimationFrame(raf)
      viewport.disconnect()
      el.textContent = text
    }
  }, [text, duration, interval, churn, wave])

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {/* começa com o texto certo: sem JS, ou antes dele, não há garrancho */}
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  )
}
