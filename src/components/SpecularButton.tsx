import { useEffect, useRef, type AnchorHTMLAttributes, type ReactNode } from 'react'

/**
 * Contorno especular em WebGL2 sobre um link de CTA.
 *
 * A borda arredondada é descrita por uma SDF; a faixa de luz que corre por ela
 * é uma janela angular medida com a normal elíptica, então o brilho escorrega
 * de forma contínua pelas retas e pelos cantos. O ângulo da luz aponta para o
 * ponteiro em qualquer lugar da página e a intensidade sobe conforme ele chega
 * perto — passando por cima, a luz se acomoda na diagonal e balança de leve
 * com a posição do cursor dentro do botão.
 *
 * A borda estática de CSS continua no elemento: ela é a base do contorno e o
 * que sobra quando não há WebGL2. O shader só soma o realce por cima.
 */

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 o;

uniform vec2  uCenter;    // centro do retângulo, em pixels de buffer
uniform vec2  uHalfSize;  // meia largura/altura, em pixels de buffer
uniform float uRadius;
uniform float uAngle;     // direção da luz
uniform float uPx;        // 1px de tela, em pixels de buffer
uniform vec3  uLineColor;
uniform float uIntensity;
uniform float uShineSize; // abertura da janela angular (rad)
uniform float uShineFade; // suavidade das pontas da janela (rad)
uniform float uThickness;

float sdRoundedRect(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// gaussiana levemente mais fechada longe do centro: o filete não vira borrão
float gaussianLine(float d, float sigma){
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main(){
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = sdRoundedRect(p, uHalfSize, uRadius);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // realce simétrico: as bordas de frente e de costas para a luz acendem juntas
  vec2 n = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(n, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);

  float line = gaussianLine(d, uThickness);
  float edge = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float a = clamp(line * rim * edge * uIntensity, 0.0, 1.0);

  o = vec4(uLineColor * a, a); // alpha pré-multiplicado
}`

/** #rgb ou #rrggbb -> [r,g,b] em 0..1 */
function toRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h
  const n = Number.parseInt(full, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/**
 * Um único listener de ponteiro para todos os botões da página: cada instância
 * se inscreve e faz sua própria conta com o retângulo dela.
 */
const listeners = new Set<(e: PointerEvent) => void>()
const relay = (e: PointerEvent) => listeners.forEach((fn) => fn(e))

function onPointer(handler: (e: PointerEvent) => void) {
  if (listeners.size === 0) window.addEventListener('pointermove', relay)
  listeners.add(handler)

  return () => {
    listeners.delete(handler)
    if (listeners.size === 0) window.removeEventListener('pointermove', relay)
  }
}

type SpecularButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  /** precisa bater com o raio da classe de borda (rounded-xl = 12, rounded-lg = 8) */
  radius?: number
  lineColor?: string
  intensity?: number
  /** abertura e suavidade da janela de brilho, em graus */
  shineSize?: number
  shineFade?: number
  thickness?: number
  /** varredura lenta de reserva, enquanto o ponteiro não se mexeu (rad/s) */
  speed?: number
  /** varredura sozinha, onde não há ponteiro para seguir — celular (rad/s) */
  autoSpeed?: number
  /** distância em px a partir da qual o brilho começa a acender */
  proximity?: number
}

export function SpecularButton({
  children,
  className = '',
  radius = 12,
  lineColor = '#ffffff',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  autoSpeed = 1.1,
  proximity = 250,
  ...anchorProps
}: SpecularButtonProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // o loop lê os ajustes daqui, então trocá-los não remonta o contexto WebGL
  const tuning = useRef({
    radius, lineColor, intensity, shineSize, shineFade, thickness, speed, autoSpeed, proximity,
  })
  useEffect(() => {
    tuning.current = {
      radius, lineColor, intensity, shineSize, shineFade, thickness, speed, autoSpeed, proximity,
    }
  })

  useEffect(() => {
    const anchor = anchorRef.current
    const canvas = canvasRef.current
    if (!anchor || !canvas) return

    /**
     * Onde há mouse a luz segue o ponteiro. Onde não há — celular, tablet — ela
     * corre sozinha em volta do botão, senão o `pointermove` nunca chegaria e o
     * contorno ficaria apagado a viagem inteira.
     *
     * Com movimento reduzido no sistema, a varredura automática não acontece:
     * ela é a única que ninguém pediu. O botão fica com a borda de CSS.
     */
    const auto = !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (auto && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
    })
    if (!gl) return // sem WebGL2 o botão fica só com a borda de CSS

    const shaders: WebGLShader[] = []
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let observer: ResizeObserver | null = null
    let viewport: IntersectionObserver | null = null
    let unsubscribe: (() => void) | null = null
    let raf = 0

    /** Libera o que foi criado — nunca o contexto: `getContext` devolve sempre
     *  o mesmo objeto para este canvas e o StrictMode monta o efeito duas vezes. */
    const dispose = () => {
      cancelAnimationFrame(raf)
      observer?.disconnect()
      viewport?.disconnect()
      unsubscribe?.()
      shaders.forEach((shader) => gl.deleteShader(shader))
      if (program) gl.deleteProgram(program)
      if (buffer) gl.deleteBuffer(buffer)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }

    /**
     * Monta shader, buffer e listeners. Chamada de novo quando o navegador
     * devolve o contexto — o que existia antes foi invalidado junto com ele.
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
        gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error(gl.getProgramInfoLog(program) || 'programa não linkou')
        }
        gl.useProgram(program)

        buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        const loc = gl.getAttribLocation(program, 'p')
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

        const uCenter = gl.getUniformLocation(program, 'uCenter')
        const uHalfSize = gl.getUniformLocation(program, 'uHalfSize')
        const uRadius = gl.getUniformLocation(program, 'uRadius')
        const uAngle = gl.getUniformLocation(program, 'uAngle')
        const uPx = gl.getUniformLocation(program, 'uPx')
        const uLineColor = gl.getUniformLocation(program, 'uLineColor')
        const uIntensity = gl.getUniformLocation(program, 'uIntensity')
        const uShineSize = gl.getUniformLocation(program, 'uShineSize')
        const uShineFade = gl.getUniformLocation(program, 'uShineFade')
        const uThickness = gl.getUniformLocation(program, 'uThickness')

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        gl.uniform1f(uPx, dpr)

        let cssW = 1
        let cssH = 1

        /**
         * O canvas é medido pelo próprio elemento e o retângulo do botão entra
         * por diferença: o span que segura o canvas é posicionado pela caixa de
         * *padding* do link, então somar a folga na mão erraria pela largura da
         * borda. `uCenter` vai em coordenadas de `gl_FragCoord` — origem embaixo.
         */
        const resize = () => {
          const a = anchor.getBoundingClientRect()
          const c = canvas.getBoundingClientRect()
          const bufW = Math.round(c.width * dpr)
          const bufH = Math.round(c.height * dpr)
          if (!bufW || !bufH) return

          cssW = a.width
          cssH = a.height
          canvas.width = bufW
          canvas.height = bufH
          gl.viewport(0, 0, bufW, bufH)
          gl.uniform2f(
            uCenter,
            (a.left + a.width / 2 - c.left) * dpr,
            (c.bottom - (a.top + a.height / 2)) * dpr,
          )
          gl.uniform2f(uHalfSize, (a.width / 2) * dpr, (a.height / 2) * dpr)
        }

        observer = new ResizeObserver(resize)
        observer.observe(anchor)
        resize()

        let angle = 2.4
        let idleAngle = 2.4
        let pointerAngle: number | null = null
        let nearness = 0
        let bright = 0
        let visible = true
        let last = 0

        let lastColor = ''
        let rgb: [number, number, number] = [1, 1, 1]

        const frame = (now: number) => {
          raf = 0
          if (!visible) return

          const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
          last = now
          const t = tuning.current

          idleAngle += (auto ? t.autoSpeed : t.speed) * dt
          const target = pointerAngle ?? idleAngle
          // caminho mais curto no círculo: o brilho nunca dá a volta ao contrário
          const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
          angle += diff * (1 - Math.exp(-dt * 7))
          bright += (nearness - bright) * (1 - Math.exp(-dt * 8))

          if (t.lineColor !== lastColor) {
            lastColor = t.lineColor
            rgb = toRgb(t.lineColor)
          }

          gl.uniform1f(uAngle, angle)
          gl.uniform1f(uRadius, Math.min(t.radius, Math.min(cssW, cssH) / 2) * dpr)
          gl.uniform3f(uLineColor, rgb[0], rgb[1], rgb[2])
          gl.uniform1f(uIntensity, t.intensity * bright)
          gl.uniform1f(uShineSize, (t.shineSize * Math.PI) / 180)
          gl.uniform1f(uShineFade, (t.shineFade * Math.PI) / 180)
          gl.uniform1f(uThickness, t.thickness * dpr)
          gl.clearColor(0, 0, 0, 0)
          gl.clear(gl.COLOR_BUFFER_BIT)
          gl.drawArrays(gl.TRIANGLES, 0, 3)

          // apagado e sem ninguém por perto: para o loop até o ponteiro voltar
          if (bright < 0.002 && nearness === 0) return
          raf = requestAnimationFrame(frame)
        }

        const start = () => {
          if (raf || !visible) return
          last = 0
          raf = requestAnimationFrame(frame)
        }

        if (auto) {
          // acende e fica: sem ponteiro para seguir, o que muda é só o ângulo.
          // Nada de assinar o `pointermove` aqui — no toque ele até dispara ao
          // arrastar a tela, e o brilho ficaria preso no ângulo do dedo.
          nearness = 1
        } else {
          unsubscribe = onPointer((e) => {
            const rect = anchor.getBoundingClientRect()
            const cx = rect.left + rect.width / 2
            const cy = rect.top + rect.height / 2
            const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right)
            const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom)
            const dist = Math.hypot(dx, dy)

            if (dist === 0) {
              // por cima do botão a luz descansa na diagonal, enquadrando os cantos
              const nx = (e.clientX - cx) / (rect.width / 2)
              const ny = (cy - e.clientY) / (rect.height / 2)
              pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15
            } else {
              pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx)
            }

            const t = Math.max(0, 1 - dist / Math.max(tuning.current.proximity, 1))
            nearness = t * t * (3 - 2 * t)
            start()
          })
        }

        /** Fora da tela não desenha — o botão do rodapé não gasta GPU no hero. */
        viewport = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting
            if (visible) start()
          },
          { rootMargin: '120px' },
        )
        viewport.observe(anchor)

        raf = requestAnimationFrame(frame)
      } catch (error) {
        console.warn('Contorno especular desativado:', error)
        dispose()
      }
    }

    /** A aba em segundo plano perde a memória de vídeo; sem isto o contorno
     *  não voltaria mais. `preventDefault` autoriza o navegador a devolver. */
    const onLost = (event: Event) => {
      event.preventDefault()
      cancelAnimationFrame(raf)
      raf = 0
      observer?.disconnect()
      viewport?.disconnect()
      unsubscribe?.()
      unsubscribe = null
    }

    const onRestored = () => {
      shaders.length = 0
      program = null
      buffer = null
      build()
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    build()

    return dispose
  }, [])

  return (
    <a
      {...anchorProps}
      ref={anchorRef}
      className={`relative inline-flex cursor-pointer items-center justify-center transition-[border-color,color,transform] duration-150 active:scale-[0.97] ${className}`}
    >
      {/* o canvas mora num span: elemento substituído com `inset` não estica,
          ele ficaria do tamanho em atributos (pixels de buffer) */}
      <span aria-hidden="true" className="pointer-events-none absolute -inset-5 block">
        <canvas ref={canvasRef} className="block size-full" />
      </span>
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </a>
  )
}
