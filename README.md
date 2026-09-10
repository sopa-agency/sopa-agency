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
| WebGL2 | o feixe de luz do hero e do footer, sem biblioteca |

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

## Deploy

Vercel. O `vercel.json` na raiz é o que aponta o framework:

```json
{ "framework": "vite", "buildCommand": "pnpm build", "outputDirectory": "dist" }
```

> **Não apague esse arquivo.** O projeto na Vercel foi criado quando este repo
> era um app Next.js, e o preset de framework lá continua Next. Sem a chave
> `framework`, o deploy instala as dependências sem reclamar e só então falha em
> `No Next.js version detected`. As chaves do `vercel.json` têm precedência sobre
> o painel, então o conserto fica versionado junto com o código.

Sem rewrite de SPA de propósito: a página é uma só, e um fallback para o
`index.html` faria qualquer URL errada responder 200 em vez de 404.

## Estrutura

```
src/
├── App.tsx                # monta as seções na ordem da página
├── data/content.ts        # TODA a copy do site
├── sections/              # uma seção por arquivo
│   ├── Hero.tsx           # hero com scrollytelling
│   ├── Services.tsx       # dois cards com painel visual
│   ├── Faq.tsx            # acordeão em pills
│   └── Footer.tsx         # CTA de fecho + feixe
├── components/
│   ├── Menu.tsx           # menu que abre a partir de quatro pontos
│   ├── SpecularButton.tsx # botão com reflexo que segue o cursor
│   ├── ScrambleText.tsx   # texto que se embaralha ao entrar (sem uso hoje)
│   ├── SectionHeading.tsx # eyebrow + título das seções
│   ├── Icon.tsx           # ícones em traço, um switch de paths
│   ├── hero/
│   │   ├── LightBeam.tsx     # feixe de luz (shader WebGL2)
│   │   ├── beamShaders.ts    # vertex e fragment do feixe
│   │   ├── Starfield.tsx     # poeira de estrelas piscando (canvas 2D)
│   │   └── HeroStory.tsx     # narrativa em terminal que atravessa o card
│   └── services/
│       ├── WorkGrid.tsx      # trabalhos no ar, o vídeo toca no lugar do print
│       └── ProcessSteps.tsx  # como um contrato de automação começa
├── assets/trabalhos/      # clipe + print de cada trabalho, casados por slug
├── hooks/
│   ├── useHeroScroll.ts   # todo o comportamento de scroll do hero
│   └── useEnterProgress.ts # progresso de entrada de uma seção na viewport
└── index.css              # @theme (cores, fontes, keyframes) + @utility próprios
```

## As seções

A página é `Hero → Serviços → FAQ → Footer`. A navegação aponta para as âncoras
`#servicos`, `#faq` e `#contato` (esta última é o próprio footer).

### Onde a página pede contato

Quatro pontos, cada um com uma razão diferente para existir — a política está
escrita por extenso no topo do `content.ts`, e é para lá que vai qualquer
mudança:

| ponto | por quê |
|---|---|
| menu | sempre à mão, para quem já decidiu antes de ler |
| hero | a porta de entrada, ainda sem contexto |
| card de serviço (×2) | cada um abre o WhatsApp já falando do assunto DELE — é o que os faz merecer o lugar, em vez de serem o mesmo botão duas vezes |
| rodapé | o fecho, para quem leu a página inteira |

**Sem CTA de propósito:** o fim da narrativa do hero (caía uma tela antes dos
serviços) e o FAQ (quem está tirando dúvida ainda não decidiu, e o rodapé vem
logo depois). Botão repetido em toda seção deixa de ser convite e vira ruído.

### Hero

Cinco camadas empilhadas dentro de um card, de baixo para cima:

1. **gradiente** escuro do card (`--color-hero-top/mid/bot`)
2. **Starfield** — pontos pequenos e esparsos piscando fora de fase, em canvas
   2D. Sem forma de estrela: nesta escala um disco de um pixel e pouco é o que
   o olho lê como brilho distante. Os alfas são altos para um céu, porque o
   fundo aqui é cinza e não preto — no valor "realista" as estrelas sumiam
   dentro do degradê
3. **LightBeam** — shader WebGL2: uma linha central ondulante vira intensidade;
   a dispersão de prisma varre offsets verticais coloridos, e camadas de névoa
   tingem o fundo de quente (esquerda) a frio (direita)
4. **bloco central** — a palavra gigante e, pendurados nela, os botões
5. **HeroStory** — a narrativa que atravessa o card, no registro de terminal
   do bloco do canto (ver abaixo)

Os dois canvas são medidos pela **viewport**, não pelo card: o padding do card
cresce a cada frame enquanto se rola, e um canvas que acompanhasse esse tamanho
realocaria o buffer de desenho sessenta vezes por segundo. Quem recorta nas
bordas é o `overflow-hidden` do card.

O H1 é a própria palavra **SOPA** em corpo gigante e só contorno
(`-webkit-text-stroke`), no centro exato do card. Tudo o que vem depois dela — o
"Agency" e os botões — está fora do fluxo, pendurado num `top-full`: a altura do
wrapper é a da palavra e mais nada, então mexer no que vem embaixo não desloca o
que é para ficar no meio. Três cópias sobrepostas: o contorno, uma que acende
num pulso lento (`animate-breathe`) e uma que recorta o facho de luz
(`text-shine`) — como o miolo das letras é vazado, a luz passa por DENTRO delas.

`useHeroScroll` roda um único loop de animação e dirige as etapas a partir da
posição de scroll dentro do track do hero:

| etapa | faixa do track | o que faz |
|---|---|---|
| bordas fecham | 0 → 30% | `--p` (0→1) alimenta o `padding` e o `border-radius`; o preto do fundo aparece por trás e o card "se solta" das bordas |
| moldura sai | 0,5 → 5,5% | `--hc` (1→0) apaga o texto do canto, os botões e a dica, com os botões **subindo** 36px |
| feixe se abre | 0 → 14% | `beamRef` (0→1) rasga o feixe ao meio (ver abaixo) |
| palavra some | 10 → 22% | `--hw` (1→0), depois da moldura: entre as duas sobra um instante com a marca sozinha no card |
| narrativa passa | 4 → 94% | o bloco de texto sobe de baixo para cima |
| leitura | — | cada **linha** surge apagada no pé do card, é acesa por um facho da esquerda para a direita na altura do olho e vai apagando ao sair por cima |

#### O ritmo, e por que estes números

A narrativa é uma **saída de terminal** — `//` abrindo cada trecho,
monoespaçada no corpo, quebras de linha à mão — e a unidade do efeito é a
**linha**, não o parágrafo. O hook mede uma por uma e escreve nelas `--typed`
(0 → 1) e a opacidade.

São três faixas, e elas fazem coisas diferentes de propósito:

| faixa | altura da janela | o que faz |
|---|---|---|
| `APPEAR` | 0,98 → 0,72 | a linha surge, **apagada**, ainda no pé do card |
| `WIPE` | 0,60 → 0,55 | o facho a acende da esquerda para a direita, com o cursor na ponta |
| `FADE` | 0,30 → 0,06 | vai apagando ao sair por cima, até `READ_DIM` — não até zero |

A separação entre `APPEAR` e `WIPE` é o que faz o efeito funcionar. A primeira
versão cortava a linha com `clip-path`, então ela só nascia quando o facho a
alcançava; para o card não ficar vazio embaixo, o facho tinha que ser largo, e
largo ele pegava cinco linhas ao mesmo tempo — cinco cursores piscando, o que
terminal nenhum faz. Com as linhas já presentes em cinza, o facho pode ser
estreito e sobra um cursor. Card vazio no meio de um scroll longo lê como fim de
página, e a pessoa para de rolar; é por isso que `APPEAR` começa quase no pé da
tela.

O que já foi lido não some: fica em `READ_DIM`, como scrollback. Sai da tela
porque rolou, não porque apagou.

> **As quebras de linha em `content.ts` são estruturais.** Cada string é uma
> linha de verdade na tela — é ela que o facho atravessa e é ela que acende e
> apaga. Por isso o corpo é dimensionado em `ch`, para a linha mais longa (46
> caracteres) nunca refluir: refluindo, o facho valeria para duas fileiras ao
> mesmo tempo. Mexer na copy é mexer nas quebras, e quebrar em fim de oração,
> nunca no meio de um sintagma — a linha é lida sozinha, iluminada, com as
> vizinhas apagadas.

O mesmo defeito existia na outra ponta, e por isso `CURTAIN` caiu de 1 tela para
0,4 e `HOLD` de 0,3 para 0,1. O hero fica **imóvel** durante a cortina; uma tela
inteira disso, com o texto parado e o feixe já embora, também lê como fim. Com
0,4 ele solta a fixação cedo e volta a deslizar junto com a seção que sobe.

> **`CURTAIN` e o `-mt-[40vh]` do `Services` são o mesmo número visto de dois
> lugares.** Mexer num sem o outro faz o progresso do hero terminar em hora
> diferente da que a cortina começa.

Tudo é recalculado a cada frame a partir do scroll, então o efeito acompanha a
rolagem **nos dois sentidos**. A distância percorrida pela narrativa é medida
para que o último parágrafo termine centralizado, em vez de passar direto.

#### A abertura do feixe

O feixe não sai de cena apagando: ele **arrebenta**. O shader recebe `uB` (0→1)
e desloca o campo para fora — acima da linha central subtrai o raio, abaixo
soma —, então o perfil inteiro passa a existir em duas cópias que voam para o
topo e para o pé do quadro, borrando no caminho, enquanto uma máscara devolve o
preto do card pelo meio. Um clarão satura a luz e tira a cor no instante do
rasgo. Em `uB = 0` o deslocamento é zero e o desenho é o de sempre — é por isso
que o feixe do rodapé, que não recebe scroll nenhum, continua idêntico.

O valor viaja num **ref**, não numa variável CSS: quem desenha é um shader, e um
uniform não se alimenta de `--var`. Ler a variável de volta com
`getComputedStyle` custaria um cálculo de estilo por frame.

> **Cuidado ao mexer no `HeroStory`:** no Tailwind v4 os utilitários de translate
> usam a propriedade `translate`, que **compõe** com o `transform` inline em vez
> de substituí-lo. Quem posiciona o bloco é o hook — não adicione
> `-translate-x-1/2` lá, ou o deslocamento em X sai dobrado.

### Serviços

Duas **faixas** de largura inteira, uma por frente de trabalho, na mesma
disposição: texto à esquerda, painel à direita. Cada faixa tem um acento próprio
— âmbar para **Criação**, azul para **Automação** — que ela define em `--accent`
inline, e os filhos consomem via `text-(--accent)`, `bg-(--accent)`… Assim os
painéis não precisam saber de qual faixa são.

Eram dois cards gêmeos lado a lado, e a simetria custava caro dos dois lados: os
clipes dos trabalhos — a coisa mais forte da página — ficavam com um quarto da
largura e não se enxergavam, e a lista de serviços vivia escondida atrás de um
"ver os serviços" porque não cabia aberta. Em faixa, a lista fica sempre aberta e
os clipes dobram de tamanho.

Os painéis ficam **centrados**, não esticados: os dois têm altura própria — as
proporções dos thumbs num, os quatro passos no outro. Esticados até a altura da
coluna de texto, o vão sobrava dentro deles, e no processo isso abria um buraco
de mais de cem pixels entre um passo e o seguinte.

- `WorkGrid` — os trabalhos no ar. Cada slot mostra o print e troca pelo clipe
  quando ele pode tocar; os arquivos são casados pelo slug em build time, então
  publicar um trabalho novo é salvar `<slug>.mp4`/`<slug>.webp` em
  `src/assets/trabalhos/` e citar o slug no `content.ts`. Sem print, o slot cai
  num placeholder hachurado com o domínio escrito. Uma coluna no celular: em
  duas, cada clipe ficava com uns 145px e não dava para distinguir um site do
  outro.
- `ProcessSteps` — como um contrato de automação começa, em quatro passos
  ligados por um fio.

> **Por que não uma grade de logos.** Este painel era uma parede de ferramentas
> — HubSpot, Pipedrive, RD Station, Bling, Omie… Logo de ferramenta responde
> "com o que vocês trabalham"; a pergunta que o cliente faz *antes* dessa é
> "serve para mim?", e uma parede de marcas que ele não reconhece responde que
> não. O que se contrata é a **revisão da operação**, e revisão cabe em qualquer
> empresa: a linha do rodapé do painel existe só para dizer isso. Pela mesma
> razão não há nome de ferramenta na lista de serviços de Automação, e o
> headline deixou de ser sobre WhatsApp.

### FAQ

Acordeão em pills, um item aberto por vez, nenhum aberto no início. A altura da
resposta é animada por `grid-template-rows` (`0fr` → `1fr`), e `aria-expanded` +
`aria-controls` ligam o botão à resposta. Cada pergunta tem seu ícone.

### Footer

O **mesmo** `LightBeam` do hero, só com outra ancoragem da faixa — e sem receber
scroll, então ele não se abre: fica no desenho de repouso. Por cima, o título em
serifado (segunda linha em itálico, o único lugar do site com esse contraste), o
lede, o CTA de fecho e a linha de links.

A palavra gigante em contorno morava aqui e subiu para o hero: nas duas pontas
ela deixava de ser o retrato da marca e virava textura.

## Ajustar conteúdo

**Todo** o texto do site está em `src/data/content.ts`, exportado por seção
(`hero`, `services`, `faq`, `footer`). Nenhum componente tem texto embutido —
para mudar a copy, os itens do FAQ, os serviços dos cards ou os links do rodapé,
mexa só nesse arquivo.

As **meta tags** são a exceção: sem framework para gerar o `<head>`, o title, a
description, o Open Graph e o JSON-LD são escritos à mão no `index.html`. Os
robôs de preview de link não executam JavaScript, então o que aparece no
WhatsApp e no LinkedIn sai de lá.

### A imagem de preview

`public/og.jpg` é um **print da home de verdade**, não uma arte à parte: a
palavra, o feixe e as estrelas, sem o resto da interface. Refazer, quando o hero
mudar:

1. `pnpm build && pnpm preview`
2. Abrir em **1200×630** com `deviceScaleFactor: 2` — o dobro e depois reduzir
   dá antisserrilhado melhor do que capturar direto no tamanho final.
3. Esconder o que não entra: o botão do menu (`button[aria-controls="menu"]`),
   o `#menu`, e, dentro de `#topo section`, tudo que não seja canvas nem
   contenha o `h1`. Vale ir pela estrutura e não por classe: as classes do
   Tailwind mudam a cada ajuste de layout, o esqueleto (dois canvas de fundo
   mais o `h1` no meio) não.
4. Forçar `font-size: 33vw` na palavra. Ela é dimensionada por
   `min(36vw, 30vh)`, e num quadro 1200×630 quem manda é o `vh`: sairia com
   189px, pequena demais para uma miniatura de link.
5. Esperar uns 7s antes do disparo — o canvas do feixe entra com fade de 1,8s, e
   a linha central oscila devagar; o quadro bonito não é o primeiro.
6. Reduzir para 1200×630 e salvar como **JPEG**, não PNG.

> **Por que JPEG.** O mesmo quadro em PNG dá 428 KB, e o WhatsApp costuma
> desistir do preview acima de uns 300 KB. Em JPEG são 75 KB, e num quadro que é
> quase todo degradê escuro não aparece banda — o grão que o shader já joga por
> cima é o que segura isso. Trocar de volta para PNG custa o preview no lugar
> onde ele mais é usado.

## Tema

`src/index.css` concentra as decisões visuais no bloco `@theme`:

- **cores** — `hero-top/mid/bot` (gradiente do card, escurecido para a
  narrativa se sustentar sem véu atrás), `frame` (preto do fundo),
  `ink` / `ink-bright` (texto), `surface` / `surface-raised` / `card`
  (fundos), `accent-warm` / `accent-cool` / `accent-mint`
  (acentos por seção), `stroke` / `stroke-glow` (contorno da palavra do hero)
- **fontes** — `sans` (Geist) no corpo, `display` (Bricolage Grotesque) e
  `serif` (Instrument Serif) nos títulos, `mono` nos rótulos
- **animação** — `animate-breathe` (pulso da palavra do hero), `animate-caret`
  (piscar do cursor da narrativa), `animate-shine`, `animate-dot-drift`

Os utilitários próprios ficam fora do `@theme`, declarados com `@utility` para
que aceitem variantes (`md:line-dots`): `bg-hatch`, `text-shine`,
`line-reading`, `line-dots`, `h-viewport` / `min-h-viewport`.

O `text-halo` — um véu desfocado atrás da narrativa — foi embora junto com o
escurecimento do card. Ele existia por causa do feixe de luz passando por trás
do texto, e o feixe hoje já se abriu e saiu bem antes de a narrativa chegar: o
que sobrava dele era um borrão sem motivo.

## Estado atual

As quatro seções estão construídas e responsivas (checadas em 1440px e 390px).
O que ainda é placeholder e deve ser trocado antes de publicar:

- **o número de WhatsApp em `content.ts` é de teste** — trocar pelo da SOPA
- **PT/EN e claro/escuro no menu são maquete** — seguem `disabled` até haver
  copy inglesa escrita e paleta clara desenhada
- não há analytics, formulário de contato nem testes
