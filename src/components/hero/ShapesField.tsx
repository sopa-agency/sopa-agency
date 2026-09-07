import { useEffect, useRef } from 'react'

/**
 * Campo de formas: hexágonos concêntricos em wireframe, desenhados em canvas 2D
 * com uma rotação lentíssima — anéis alternam o sentido do giro, o que faz o
 * conjunto respirar sem nunca repetir o mesmo desenho. O fade das bordas vem da
 * máscara radial no CSS.
 */
export function ShapesField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let cx = 0
    let cy = 0
    let radius = 0

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      cx = canvas.width / 2
      cy = canvas.height / 2
      radius = Math.min(canvas.width, canvas.height) * 0.48
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const hexagon = (r: number, rot: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = rot + (i * Math.PI) / 3
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
    }

    let raf = 0
    let visible = true
    const frame = (now: number) => {
      if (!visible) {
        raf = 0
        return
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = now / 1000
      const rings = 7
      for (let i = 1; i <= rings; i++) {
        const r = radius * (i / rings)
        const rot = t * 0.04 * (i % 2 ? 1 : -1) + i * 0.15
        ctx.lineWidth = 1 * dpr
        ctx.strokeStyle = `rgba(253,252,252,${0.1 + 0.035 * (1 - i / rings)})`
        hexagon(r, rot)
        ctx.stroke()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    /** Fora da tela não desenha: a rotação vem do tempo absoluto, então ao
     *  voltar ela reaparece exatamente na fase em que estaria. */
    const viewport = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(frame)
      },
      { rootMargin: '120px' },
    )
    viewport.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      viewport.disconnect()
    }
  }, [])

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[135vmin] w-[135vmin] -translate-x-1/2 -translate-y-1/2">
      <canvas ref={canvasRef} className="mask-shapes-field block h-full w-full" />
    </div>
  )
}
