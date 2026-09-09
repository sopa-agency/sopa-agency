import { useEffect, useRef } from 'react'

/** Uma estrela a cada tanto de pixel de tela — quanto maior o número, mais vazio. */
const AREA_PER_STAR = 14000
/** Piso e teto de contagem: numa tela de celular a conta acima daria um punhado
 *  de pontos perdidos, e num monitor muito grande, poeira demais. */
const STAR_RANGE = { min: 40, max: 200 }

/**
 * Quase todas brancas. As poucas tingidas puxam para as pontas do MESMO espectro
 * do feixe — âmbar de um lado, azul do outro —, então o campo não parece vir de
 * outro desenho.
 */
const TINTS = ['255,252,248', '255,252,248', '255,252,248', '255,236,214', '214,232,255']

type Star = {
  /** posição normalizada (0..1): sobrevive a um redimensionamento sem sortear de novo */
  x: number
  y: number
  r: number
  base: number
  amp: number
  /** duas velocidades por estrela: com uma só, o campo inteiro pulsa em compasso */
  speedA: number
  speedB: number
  phase: number
  tint: string
  halo: boolean
}

/**
 * Gerador congruente linear minúsculo — o mesmo céu em toda montagem. Com
 * `Math.random` o campo se redesenhava a cada HMR e a cada remontagem do
 * StrictMode, e a troca piscava na tela sem motivo nenhum.
 */
function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

function makeStars(count: number): Star[] {
  const rand = rng(0x5057a1)
  return Array.from({ length: count }, () => {
    // ~8% ganham corpo e um halo: sem nenhuma maior que as outras o campo vira
    // ruído uniforme, que o olho lê como sujeira e não como distância
    const bright = rand() < 0.08
    return {
      x: rand(),
      y: rand(),
      r: bright ? 1.1 + rand() * 0.8 : 0.5 + rand() * 0.6,
      // O fundo do card é cinza, não preto: os valores que num céu de verdade
      // já seriam estrela aqui desaparecem dentro do degradê. Daí o piso alto.
      base: bright ? 0.5 + rand() * 0.28 : 0.18 + rand() * 0.3,
      amp: 0.08 + rand() * 0.24,
      speedA: 0.25 + rand() * 0.8,
      speedB: 0.11 + rand() * 0.35,
      phase: rand() * Math.PI * 2,
      tint: TINTS[Math.floor(rand() * TINTS.length)],
      halo: bright,
    }
  })
}

/**
 * Poeira de estrelas no fundo do card: pontos pequenos, esparsos, piscando fora
 * de fase. Sem forma de estrela — é um disco de um pixel e pouco, que nesta
 * escala é o que o olho lê como brilho distante; a ponta de cinco braços viraria
 * ícone.
 *
 * O canvas é medido pela VIEWPORT, não pelo card. O padding do card cresce a
 * cada frame enquanto se rola, e um canvas que acompanhasse esse tamanho
 * realocaria o buffer de desenho sessenta vezes por segundo. Quem recorta nas
 * bordas é o `overflow-hidden` do card. É a mesma razão pela qual o `LightBeam`
 * faz igual — ver o comentário de lá.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let stars: Star[] = []
    let w = 0
    let h = 0

    const resize = (cssW: number, cssH: number) => {
      const nextW = Math.round(cssW * dpr)
      const nextH = Math.round(cssH * dpr)
      if (!nextW || !nextH || (nextW === w && nextH === h)) return
      w = nextW
      h = nextH
      canvas.width = w
      canvas.height = h

      const target = Math.round((cssW * cssH) / AREA_PER_STAR)
      const count = Math.min(STAR_RANGE.max, Math.max(STAR_RANGE.min, target))
      // só sorteia de novo se a CONTAGEM mudou: as posições são normalizadas,
      // então um redimensionamento qualquer só remapeia o céu que já existe
      if (count !== stars.length) stars = makeStars(count)
      if (still) draw(0)
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const star of stars) {
        const twinkle = still
          ? 0
          : Math.sin(t * star.speedA + star.phase) * 0.7 +
            Math.sin(t * star.speedB + star.phase * 1.7) * 0.3
        const alpha = star.base + star.amp * twinkle
        if (alpha <= 0.012) continue

        const x = star.x * w
        const y = star.y * h

        if (star.halo) {
          ctx.fillStyle = `rgba(${star.tint},${alpha * 0.2})`
          ctx.beginPath()
          ctx.arc(x, y, star.r * dpr * 3.4, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = `rgba(${star.tint},${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, star.r * dpr, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // `contentRect` já vem medido pelo observer: ler `clientWidth` aqui forçaria
    // um novo cálculo de layout a cada notificação
    const observer = new ResizeObserver(([entry]) => {
      resize(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(canvas)
    resize(canvas.clientWidth, canvas.clientHeight)

    let raf = 0
    let visible = true
    const frame = (now: number) => {
      if (!visible) {
        raf = 0
        return
      }
      draw(now / 1000)
      raf = requestAnimationFrame(frame)
    }

    /** Fora da tela não desenha. O pulso vem do tempo absoluto, então ao voltar
     *  o campo reaparece na fase exata em que estaria. */
    const viewport = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !raf && !still) raf = requestAnimationFrame(frame)
      },
      { rootMargin: '120px' },
    )
    viewport.observe(canvas)

    if (!still) raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      viewport.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-viewport w-screen -translate-x-1/2 -translate-y-1/2"
    />
  )
}
