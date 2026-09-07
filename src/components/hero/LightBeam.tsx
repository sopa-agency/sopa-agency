import { useEffect, useRef, useState } from 'react'

import { BEAM_FRAG, BEAM_VERT } from './beamShaders'

/**
 * Faixa horizontal com o feixe de luz renderizado em WebGL2.
 * O canvas entra com fade suave assim que o primeiro frame é desenhado.
 *
 * `className` posiciona a faixa dentro do container (o hero e o footer usam
 * alturas e ancoragens diferentes). Se o WebGL2 não estiver disponível (ou o
 * shader falhar), o componente apenas não desenha nada — a seção segue de pé.
 */
export function LightBeam({ className = 'top-[6vh] h-[88vh]' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    })
    if (!gl) {
      console.warn('WebGL2 indisponível — hero segue sem o feixe de luz.')
      return
    }

    const shaders: WebGLShader[] = []
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let observer: ResizeObserver | null = null
    let viewport: IntersectionObserver | null = null
    let raf = 0
    let fadeIn = 0
    let last = 0
    let elapsed = 0

    /** Libera o que foi criado, mas NUNCA perde o contexto: `getContext` devolve
     *  sempre o mesmo objeto para este canvas, e um contexto perdido não
     *  compila mais nada no remount (StrictMode monta o efeito duas vezes). */
    const dispose = () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(fadeIn)
      observer?.disconnect()
      viewport?.disconnect()
      shaders.forEach((shader) => gl.deleteShader(shader))
      if (program) gl.deleteProgram(program)
      if (buffer) gl.deleteBuffer(buffer)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }

    /**
     * Monta shaders, buffer e observers. É chamada de novo quando o navegador
     * devolve o contexto: o que existia antes foi invalidado junto com ele.
     */
    const build = () => {
      try {
        const compile = (type: number, src: string) => {
          const shader = gl.createShader(type)
          if (!shader) throw new Error('não foi possível criar o shader')
          shaders.push(shader)
          gl.shaderSource(shader, src)
          gl.compileShader(shader)
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader) || 'shader não compilou')
          }
          return shader
        }

        program = gl.createProgram()
        if (!program) throw new Error('não foi possível criar o programa')
        gl.attachShader(program, compile(gl.VERTEX_SHADER, BEAM_VERT))
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, BEAM_FRAG))
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error(gl.getProgramInfoLog(program) || 'programa não linkou')
        }
        gl.useProgram(program)

        // um triângulo que cobre o viewport inteiro
        buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        const loc = gl.getAttribLocation(program, 'p')
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        const uRes = gl.getUniformLocation(program, 'uRes')
        const uT = gl.getUniformLocation(program, 'uT')

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        let bufW = 0
        let bufH = 0

        /**
         * O canvas é medido pela viewport (`w-screen` + `vh`), não pelo card: o
         * padding do card cresce com o scroll e, se o elemento acompanhasse, o
         * buffer de desenho seria realocado a cada frame — era isso que fazia o
         * feixe piscar. Quem recorta o feixe nas bordas continua sendo o
         * `overflow-hidden` do card, então o efeito é o mesmo.
         *
         * Sobrando só o redimensionamento real da janela, o buffer pode ter o
         * tamanho exato do elemento.
         */
        const resize = (cssW: number, cssH: number) => {
          const w = Math.round(cssW * dpr)
          const h = Math.round(cssH * dpr)
          if (!w || !h || (w === bufW && h === bufH)) return
          bufW = w
          bufH = h
          canvas.width = w
          canvas.height = h
          gl.viewport(0, 0, w, h)
        }

        // `contentRect` já vem medido pelo observer: ler `clientWidth` aqui
        // forçaria um novo cálculo de layout a cada notificação.
        observer = new ResizeObserver(([entry]) => {
          resize(entry.contentRect.width, entry.contentRect.height)
        })
        observer.observe(canvas)
        resize(canvas.clientWidth, canvas.clientHeight)

        let visible = true

        const frame = (now: number) => {
          if (!visible) {
            raf = 0
            return
          }
          // tempo acumulado em vez de (agora - início): ao voltar de uma pausa o
          // feixe continua de onde parou em vez de saltar adiante
          if (last) elapsed += Math.min(now - last, 100)
          last = now

          gl.uniform2f(uRes, bufW, bufH)
          gl.uniform1f(uT, elapsed / 1000)
          gl.clearColor(0, 0, 0, 0)
          gl.clear(gl.COLOR_BUFFER_BIT)
          gl.drawArrays(gl.TRIANGLES, 0, 3)
          raf = requestAnimationFrame(frame)
        }

        /** Fora da tela não desenha: o feixe do rodapé não disputa GPU com o do hero. */
        viewport = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting
            if (visible && !raf) {
              last = 0
              raf = requestAnimationFrame(frame)
            }
          },
          { rootMargin: '120px' },
        )
        viewport.observe(canvas)

        raf = requestAnimationFrame(frame)
        fadeIn = requestAnimationFrame(() => setReady(true))
      } catch (error) {
        console.warn('Feixe de luz desativado:', error)
        dispose()
      }
    }

    /**
     * O sistema recolhe a memória de vídeo quando a aba vai para segundo plano
     * — no celular, trocar de app já basta. Sem isto o feixe sumiria de vez ao
     * voltar. `preventDefault` no evento de perda é o que autoriza o navegador
     * a devolver o contexto depois.
     */
    const onLost = (event: Event) => {
      event.preventDefault()
      cancelAnimationFrame(raf)
      raf = 0
      observer?.disconnect()
      viewport?.disconnect()
    }

    const onRestored = () => {
      shaders.length = 0
      program = null
      buffer = null
      last = 0 // sem isto o primeiro frame contaria o tempo todo em que ficou fora
      build()
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    build()

    return dispose
  }, [])

  return (
    <div
      className={`pointer-events-none absolute left-1/2 z-[1] w-screen -translate-x-1/2 ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`block h-full w-full transition-opacity duration-[1800ms] ease-[cubic-bezier(.22,1,.36,1)] ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
