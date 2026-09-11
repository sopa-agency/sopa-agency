/**
 * Gera o `public/og.jpg` — um print da home de verdade, não uma arte à parte.
 *
 * Dirige um Chromium headless pelo DevTools Protocol. Sem dependência nenhuma:
 * o navegador é o que já está instalado (Chrome ou Edge) e o cliente de
 * WebSocket é o global do Node 22+. Puppeteer/Playwright fariam isto em menos
 * linhas e custariam ~300 MB de browser baixado para um script que roda quando
 * o hero muda.
 *
 *   node scripts/og.mjs [url]     # default: http://localhost:4180/
 *
 * Precisa de um servidor de pé (`pnpm build && pnpm preview`) e do Pillow para
 * o passo final de redução — ver o README, seção "A imagem de preview", que
 * explica cada número daqui.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const URL_ALVO = process.argv[2] ?? 'http://localhost:4180/'
const PORTA_CDP = 9333
/** Dobro do tamanho final: reduzir depois dá antisserrilhado melhor do que
 *  capturar direto em 1200×630. */
const ESCALA = 2
const LARGURA = 1200
const ALTURA = 630
/** O canvas do feixe entra com fade de 1,8s e a linha central oscila devagar:
 *  o quadro bonito não é o primeiro. */
const ESPERA_MS = 7000

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]

const browser = BROWSERS.find((p) => existsSync(p))
if (!browser) throw new Error('Nenhum Chrome ou Edge encontrado nos caminhos conhecidos.')

const perfil = join(tmpdir(), 'og-shot-profile')
mkdirSync(perfil, { recursive: true })

const proc = spawn(
  browser,
  [
    '--headless=new',
    `--remote-debugging-port=${PORTA_CDP}`,
    `--user-data-dir=${perfil}`,
    '--no-first-run',
    '--disable-extensions',
    // o hero é WebGL: sem isto o headless cai no software rasterizer e o feixe
    // sai diferente do que o visitante vê
    '--enable-gpu',
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

/** O endpoint só responde quando o navegador terminou de subir. */
async function esperarCdp() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORTA_CDP}/json/version`)
      return (await r.json()).webSocketDebuggerUrl
    } catch {
      await dormir(200)
    }
  }
  throw new Error('O navegador não abriu a porta de debug.')
}

const ws = new WebSocket(await esperarCdp())
await new Promise((r) => (ws.onopen = r))

let id = 0
const pendentes = new Map()
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pendentes.has(msg.id)) {
    const { resolve, reject } = pendentes.get(msg.id)
    pendentes.delete(msg.id)
    if (msg.error) reject(new Error(JSON.stringify(msg.error)))
    else resolve(msg.result)
  }
}
const cdp = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const n = ++id
    pendentes.set(n, { resolve, reject })
    ws.send(JSON.stringify({ id: n, method, params, sessionId }))
  })

// uma aba própria, para não depender do que o about:blank virou
const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true })
const s = (m, p) => cdp(m, p, sessionId)

await s('Page.enable')
await s('Runtime.enable')
await s('Emulation.setDeviceMetricsOverride', {
  width: LARGURA,
  height: ALTURA,
  deviceScaleFactor: ESCALA,
  mobile: false,
})

await s('Page.navigate', { url: URL_ALVO })
await dormir(1500)

/**
 * Esconde o que não entra no quadro. Vai pela ESTRUTURA e não por classe: as
 * classes do Tailwind mudam a cada ajuste de layout, o esqueleto (os canvas de
 * fundo mais o `h1` no meio) não.
 */
const limpeza = `
  document.querySelector('button[aria-controls="menu"]')?.remove()
  document.querySelector('#menu')?.remove()

  const sec = document.querySelector('#topo section')
  const h1 = sec.querySelector('h1')
  const vistos = []

  // O feixe não é um canvas solto: mora dentro de um div. Por isso a regra é
  // "contém um canvas", e não "é um canvas" — foi o que derrubou o feixe da
  // primeira tentativa e deixou só as estrelas.
  for (const el of sec.children) {
    const fica = el.tagName === 'CANVAS' || !!el.querySelector('canvas') || el.contains(h1)
    vistos.push((fica ? 'MANTEM  ' : 'ESCONDE ') + el.tagName + '.' + (el.className || '').slice(0, 36))
    if (!fica) el.style.display = 'none'
  }

  // Os botões são IRMÃOS do h1 dentro do mesmo wrapper, pendurados num
  // top-full: manter o wrapper por causa do h1 trazia os dois junto.
  for (const el of h1.parentElement.children) if (el !== h1) el.style.display = 'none'

  // E o "Agency" pendura do próprio h1, também em absolute.
  for (const el of h1.children) {
    if (getComputedStyle(el).position === 'absolute') el.style.display = 'none'
  }

  // A palavra é dimensionada por min(36vw, 30vh), e num quadro 1200×630 quem
  // manda é o vh: sairia com 189px, pequena demais para uma miniatura de link.
  // O tamanho vai na span da marca, não no h1 — a classe dela ganharia do h1.
  const marca = h1.querySelector('span')
  marca.style.fontSize = '33vw'
  JSON.stringify({ vistos, marca: marca.textContent.trim() })
`
const { result } = await s('Runtime.evaluate', { expression: limpeza, returnByValue: true })
console.log(JSON.parse(result.value).vistos.join('\n'))
console.log('marca:', JSON.parse(result.value).marca)

await dormir(ESPERA_MS)

const { data } = await s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
writeFileSync('scripts/.og-raw.png', Buffer.from(data, 'base64'))
console.log('capturado em scripts/.og-raw.png (%dx%d)', LARGURA * ESCALA, ALTURA * ESCALA)

ws.close()
proc.kill()
