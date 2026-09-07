# SOPA — Website

Site institucional da SOPA, estúdio de criação e engenharia. Página única em
português, fundo escuro, com um hero em WebGL que conduz a narrativa por scroll.

## Stack

| Pacote | Papel |
|---|---|
| Vite 8 | build e dev server |
| React 19 | UI |
| TypeScript | tipos em tudo |
| Tailwind CSS v4 | estilo, via `@tailwindcss/vite` (sem arquivo de config — o tema mora no `@theme` do `src/index.css`) |
| oxlint | lint |
| WebGL2 + Canvas 2D | efeitos do hero e do footer, sem biblioteca |

Sem roteador, sem CMS, sem backend: tudo é estático e o conteúdo vem de um
módulo TypeScript.

## Rodar

Requer **Node >= 20.19** e **pnpm** (fixado em `packageManager`; se não estiver
instalado, `corepack enable` resolve).

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # tsc -b && vite build  -> dist/
pnpm preview    # serve o dist/ para conferir o build
pnpm lint       # oxlint
```

## Estrutura

```
src/
├── App.tsx                # monta as seções na ordem da página
├── data/content.ts        # TODA a copy do site
├── sections/              # uma seção por arquivo
│   ├── Hero.tsx           # hero com scrollytelling
│   ├── Services.tsx       # dois cards com painel visual
│   ├── Faq.tsx            # acordeão em pills
│   └── Footer.tsx         # CTA + palavra gigante + feixe
├── components/
│   ├── Menu.tsx           # menu que abre a partir de quatro pontos
│   ├── SpecularButton.tsx # botão com reflexo que segue o cursor
│   ├── ScrambleText.tsx   # texto que se embaralha ao entrar
│   ├── SectionHeading.tsx # eyebrow + título das seções
│   ├── Icon.tsx           # ícones em traço, um switch de paths
│   ├── hero/
│   │   ├── LightBeam.tsx     # feixe de luz (shader WebGL2)
│   │   ├── beamShaders.ts    # vertex e fragment do feixe
│   │   ├── ShapesField.tsx   # hexágonos em wireframe (canvas 2D)
│   │   └── HeroStory.tsx     # narrativa que atravessa o card
│   └── services/
│       ├── WorkGrid.tsx      # trabalhos no ar, o vídeo toca no lugar do print
│       ├── IntegrationGrid.tsx # ferramentas que a automação conecta
│       └── BrandMark.tsx     # logo das marcas; sem logo, cai no monograma
├── assets/trabalhos/      # clipe + print de cada trabalho, casados por slug
├── hooks/
│   ├── useHeroScroll.ts   # todo o comportamento de scroll do hero
│   └── useEnterProgress.ts # progresso de entrada de uma seção na viewport
└── index.css              # @theme (cores, fontes, keyframes) + @utility próprios
```

## As seções

A página é `Hero → Serviços → FAQ → Footer`. Os CTAs apontam para as âncoras
`#servicos`, `#faq` e `#contato` (esta última é o próprio footer), e os botões
de "entre em contato" abrem o WhatsApp com a mensagem já digitada.

### Hero

Cinco camadas empilhadas dentro de um card, de baixo para cima:

1. **gradiente** escuro do card (`--color-hero-top/mid/bot`)
2. **ShapesField** — hexágonos concêntricos girando devagar, com máscara radial
   (`mask-shapes-field`) que apaga as bordas
3. **LightBeam** — shader WebGL2: uma linha central ondulante vira intensidade;
   a dispersão de prisma varre offsets verticais coloridos, e camadas de névoa
   tingem o fundo de quente (esquerda) a frio (direita)
4. **conteúdo inicial** — logo, título, botões, subtítulo e a dica de scroll
5. **HeroStory** — a narrativa que atravessa o card

`useHeroScroll` roda um único loop de animação e dirige as etapas a partir da
posição de scroll dentro do track do hero:

| etapa | o que faz |
|---|---|
| bordas fecham | `--p` (0→1) alimenta o `padding` e o `border-radius`; o preto do fundo aparece por trás e o card "se solta" das bordas |
| título some | `--hc` (1→0) apaga o conteúdo inicial e o desloca para cima |
| narrativa passa | o bloco de texto sobe de baixo para cima; o feixe fica parado, daí o parallax |
| spotlight | cada parágrafo acende ao chegar no centro da viewport e apaga ao sair |

Tudo é recalculado a cada frame a partir do scroll, então o efeito acompanha a
rolagem **nos dois sentidos**. A distância percorrida pela narrativa é medida
para que o último bloco (o CTA) termine centralizado, em vez de passar direto.

> **Cuidado ao mexer no `HeroStory`:** no Tailwind v4 os utilitários de translate
> usam a propriedade `translate`, que **compõe** com o `transform` inline em vez
> de substituí-lo. Quem posiciona o bloco é o hook — não adicione
> `-translate-x-1/2` lá, ou o deslocamento em X sai dobrado.

### Serviços

Dois cards, cada um com um acento próprio: âmbar para **Criação**, azul para
**Automação**. O card define `--accent` inline e os filhos consomem via
`bg-(--accent)/12`, `text-(--accent)`… — assim os painéis não precisam saber de
qual card são. Cada card tem rótulo, headline, a lista de serviços que abre e
fecha, um CTA e um painel visual no rodapé:

- `WorkGrid` — os trabalhos no ar. Cada slot mostra o print e troca pelo clipe
  quando ele pode tocar; os arquivos são casados pelo slug em build time, então
  publicar um trabalho novo é salvar `<slug>.mp4`/`<slug>.webp` em
  `src/assets/trabalhos/` e citar o slug no `content.ts`. Sem print, o slot cai
  num placeholder hachurado com o domínio escrito.
- `IntegrationGrid` — as ferramentas que a automação conecta, agrupadas por
  função (por onde a conversa entra, onde a venda é registrada, o que roda a
  operação). Uma fileira por grupo. Quem tem logo aparece com ela; quem não tem
  cai no monograma tingido com uma cor da paleta do site — de propósito, para
  não fingir ser a cor da marca.

### FAQ

Acordeão em pills, um item aberto por vez, nenhum aberto no início. A altura da
resposta é animada por `grid-template-rows` (`0fr` → `1fr`), e `aria-expanded` +
`aria-controls` ligam o botão à resposta. Cada pergunta tem seu ícone.

### Footer

Mesmas camadas do hero, com o **mesmo** `LightBeam` — só muda a ancoragem da
faixa. Atrás dele, a palavra da marca em corpo gigante: preenchimento
transparente e contorno fino (`-webkit-text-stroke`), com uma segunda cópia por
cima que acende num pulso lento (`animate-breathe`).

## Ajustar conteúdo

**Todo** o texto do site está em `src/data/content.ts`, exportado por seção
(`hero`, `services`, `faq`, `footer`). Nenhum componente tem texto embutido —
para mudar a copy, os itens do FAQ, os serviços dos cards ou os links do rodapé,
mexa só nesse arquivo.

As **meta tags** são a exceção: sem framework para gerar o `<head>`, o title, a
description, o Open Graph e o JSON-LD são escritos à mão no `index.html`. Os
robôs de preview de link não executam JavaScript, então o que aparece no
WhatsApp e no LinkedIn sai de lá.

## Tema

`src/index.css` concentra as decisões visuais no bloco `@theme`:

- **cores** — `hero-top/mid/bot` (gradiente do card), `frame` (preto do fundo),
  `ink` / `ink-bright` (texto), `surface` / `surface-raised` / `card` /
  `card-panel` (fundos), `accent-warm` / `accent-cool` / `accent-mint`
  (acentos por seção), `stroke` / `stroke-glow` (contorno do footer)
- **fontes** — `sans` (Geist) no corpo, `display` (Bricolage Grotesque) e
  `serif` (Instrument Serif) nos títulos, `mono` nos rótulos
- **animação** — `animate-breathe` (pulso da palavra do footer),
  `animate-shine`, `animate-dot-drift`

Os utilitários próprios ficam fora do `@theme`, declarados com `@utility` para
que aceitem variantes (`md:mask-fade-x`): `mask-shapes-field`, `bg-hatch`,
`text-shine`, `text-halo`, `line-dots`, `h-viewport` / `min-h-viewport`.

## Estado atual

As quatro seções estão construídas e responsivas (checadas em 1440px e 390px).
O que ainda é placeholder e deve ser trocado antes de publicar:

- **o número de WhatsApp em `content.ts` é de teste** — trocar pelo da SOPA
- **o link do Instagram no rodapé aponta para a home da rede**, não para um perfil
- **PT/EN e claro/escuro no menu são maquete** — seguem `disabled` até haver
  copy inglesa escrita e paleta clara desenhada
- não há analytics, formulário de contato nem testes
