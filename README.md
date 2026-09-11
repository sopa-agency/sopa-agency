# SOPA — Website

Site institucional da SOPA, estúdio de criação e engenharia. Página única em
duas locales — português em `/` e inglês em `/en/` —, fundo escuro, com um hero
em WebGL que conduz a narrativa por scroll.

## Stack

| Pacote | Papel |
|---|---|
| Vite 8 | build e dev server |
| React 19 | UI |
| TypeScript | tipos em tudo |
| Tailwind CSS v4 | estilo, via `@tailwindcss/vite` (sem arquivo de config — o tema mora no `@theme` do `src/index.css`) |
| oxlint | lint |
| WebGL2 | o feixe de luz do hero e do footer, sem biblioteca |

Sem roteador, sem CMS, sem backend, sem biblioteca de i18n: tudo é estático e o
conteúdo vem de dois módulos TypeScript, um por idioma.

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

Sem rewrite de SPA de propósito. São duas páginas estáticas e nenhuma rota no
cliente, então um fallback para o `index.html` só faria URL errada responder 200
em vez de 404. É também por isso que o `vite.config.ts` traz `appType: 'mpa'`:
no padrão (`spa`), o `pnpm dev` e o `pnpm preview` devolvem a home para
qualquer caminho e escondem em teste o 404 que a Vercel dá em produção.

## Estrutura

```
src/
├── App.tsx                # monta as seções na ordem da página
├── data/
│   ├── content.ts         # escolhe a locale pelo `lang` do documento
│   ├── content.pt.ts      # TODA a copy em português
│   ├── content.en.ts      # TODA a copy em inglês, mesma forma
│   └── contact.ts         # o número de WhatsApp e o montador de link
├── sections/              # uma seção por arquivo
│   ├── Hero.tsx           # hero com scrollytelling
│   ├── Metodo.tsx         # "mostramos antes de explicar" + painel de preview
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
│   ├── useStageProgress.ts # progresso de um palco preso (seção 02)
│   └── useEnterProgress.ts # progresso de entrada de uma seção na viewport
└── index.css              # @theme (cores, fontes, keyframes) + @utility próprios
```

## As duas locales

Português em `/`, inglês em `/en/`. São duas **páginas estáticas**, não um
estado do React, e é o que faz o inglês existir para quem importa: robô de
preview de link e buscador não executam JavaScript, então um seletor de idioma
em estado deixaria os dois vendo só português.

O `vite.config.ts` declara as duas como entradas do mesmo build:

```ts
build: { rollupOptions: { input: { pt: 'index.html', en: 'en/index.html' } } }
```

Sai `dist/index.html` e `dist/en/index.html`, **compartilhando um bundle só** —
as duas locales viajam juntas no JS. São alguns KB de texto, e em troca a
segunda página abre com o cache quente. A Vercel serve as duas como arquivo
estático: nenhum rewrite, nenhuma mudança no `vercel.json`.

Quem decide a copy é o `lang` do documento:

```ts
// src/data/content.ts
const locale = document.documentElement.lang.startsWith('en') ? en : pt
export const { nav, hero, services, faq, footer, whatsappUrl } = locale
```

O `<script type="module">` é deferred, então o `<html>` já foi parseado quando
o módulo inicializa. **Os componentes não mudaram**: seguem importando `nav`,
`hero`, `services`… pelo nome, sem context e sem prop drilling.

O seletor do menu são dois links de verdade (`/` e `/en/`) com `hrefLang` e
`aria-current` — indexável, e sem estado para sincronizar.

> **Mexeu numa locale, mexa na outra.** As duas têm a mesma forma, e os valores
> estruturais são idênticos: `accent`, `visual`, `icon`, `slug` e os `href` de
> âncora. Só a prosa e as mensagens de WhatsApp mudam. O
> `satisfies Record<keyof typeof pt, unknown>` no fim do `content.en.ts` cobra
> as chaves de primeiro nível — esquecer uma seção quebra o build; esquecer uma
> chave de prosa aparece como texto vazio ao abrir o `/en/`.

E as quebras do `hero.story` são estruturais **nas duas**: cada string é uma
linha que o facho atravessa, com teto de 46 caracteres. Traduzir não é
substituir string, é refazer as quebras em fim de oração.

## As seções

A página é `Hero → Método → Serviços → FAQ → Footer`. A navegação aponta para as âncoras
`#servicos` e `#faq` — os `id` são os mesmos nas duas locales, então só os
rótulos são traduzidos. O footer tem `id="contato"` e o menu **não** aponta mais
para lá (ver abaixo); o `id` ficou para quem chegar por link direto.

### Onde a página pede contato

**Dois** pontos, e já foram cinco. Cada um com uma razão diferente para
existir **e um rótulo diferente** — a política está escrita por extenso no topo
do `content.ts`, e é para lá que vai qualquer mudança:

| ponto | rótulo | por quê |
|---|---|---|
| hero | Começar uma conversa | a porta de entrada, ainda sem contexto: a barreira mais baixa da página |
| rodapé | Tirar um projeto do papel | o fecho, para quem leu a página inteira e aceita o pedido mais direto |

> **O rótulo é o que separa um convite de um eco.** Dos cinco antigos, três
> diziam "Entre em contato", e era a repetição da FRASE que fazia a página soar
> insistente — não a quantidade de botões. Dois botões com o mesmo texto são um
> botão repetido, mesmo em seções distantes.

**Os dois CTAs das faixas de serviço saíram.** Eles abriam o WhatsApp já falando
do assunto da faixa, e era isso que os fazia merecer o lugar; ainda assim eram
dois dos cinco botões, e a página pesava mais do que ganhava. A seção de
serviços agora só apresenta — quem se convence rola até o rodapé.

> **Com eles foi embora a única mensagem de WhatsApp com contexto.** As duas que
> sobraram são genéricas: a conversa não chega mais dizendo se o assunto é
> criação ou automação, e a qualificação do lead passou a ser manual.

**Só o CTA do rodapé leva o ícone do WhatsApp.** Ele estava nos quatro, e um
mesmo símbolo repetido não se resolve com rótulo diferente: deixa de ser sinal e
vira textura da página. Mas tirado de todos, nenhum botão avisava que o clique
abre outro app — os rótulos falam de intenção, não de canal.

O rodapé é onde ele ganha o lugar: é o último ponto, de quem leu a página
inteira e está decidindo, e é aí que saber o canal ajuda em vez de poluir.
Aparecendo uma vez só, volta a ser sinal. **Não devolva o ícone aos outros
três** — era a repetição, não o ícone.

É também a única marca sólida do `Icon.tsx` (preenchimento em vez de traço), e
por isso o componente tem uma comparação direta com `'whatsapp'` em vez de uma
tabela: para um caso, tabela é enfeite.

**O menu não tem CTA.** É lista de navegação e nada mais — quatro links do mesmo
padrão, incluindo "Contato", que aponta para o rodapé, onde está o botão. Um
botão solto no meio dos links era o único elemento fora do padrão do menu.

**Sem CTA de propósito:** o fim da narrativa do hero (caía uma tela antes dos
serviços) e o FAQ (quem está tirando dúvida ainda não decidiu, e o rodapé vem
logo depois). Botão repetido em toda seção deixa de ser convite e vira ruído.

### Hero

Cinco camadas empilhadas dentro de um card, de baixo para cima:

1. **fundo** do card (`--color-hero-top/mid/bot`) — hoje preto puro; era
   um degradê cinza, e os três tokens continuam de pé para dar como voltar
   a um sem tocar no `Hero.tsx`
2. **Starfield** — pontos pequenos e esparsos piscando fora de fase, em canvas
   2D. Sem forma de estrela: nesta escala um disco de um pixel e pouco é o que
   o olho lê como brilho distante. Os alfas são altos para um céu, porque o
   fundo era cinza e não preto — no valor "realista" as estrelas sumiam
   dentro do degradê. **O card virou preto e este alfa não foi refeito:** hoje
   ele é exagero, e está na lista de recalibrações do `index.css`
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
| bordas fecham | 0 → 30% | `--p` (0→1) alimenta o `padding` e o `border-radius`; o `--color-frame` aparece por trás e o card "se solta" das bordas — **hoje invisível**, porque o card também é preto (ver `index.css`) |
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

**Todo** o texto do site está em `src/data/content.pt.ts` e
`src/data/content.en.ts`, por seção (`nav`, `hero`, `services`, `faq`,
`footer`). Nenhum componente tem texto embutido — nem `aria-label`. Para mudar
a copy, os itens do FAQ, os serviços dos cards ou os links do rodapé, mexa
nesses dois arquivos. O número de WhatsApp fica no `contact.ts`, porque é o
mesmo nas duas locales; as mensagens que abrem a conversa, não.

As **meta tags** são a exceção: sem framework para gerar o `<head>`, o title, a
description, o Open Graph e o JSON-LD são escritos à mão no `index.html` **e no
`en/index.html`**. Os robôs de preview de link não executam JavaScript, então o
que aparece no WhatsApp e no LinkedIn sai de lá.

> **O `<title>` é só `SOPA`.** É ele que a aba do navegador mostra, e ali cabem
> uns 20 caracteres antes de cortar — qualquer frase acrescentada aparece
> truncada e a marca some no meio dela. O preço é o headline do resultado de
> busca, que fica sem as palavras-chave; elas seguem na `description`, no
> JSON-LD e no `og:title`, que é o que o preview de link usa e continua a frase
> inteira. Se a tentação for alongar o title para agradar buscador: a aba é o
> que o cliente vê todo dia.

O par de `hreflang` tem que estar completo nas duas páginas (`pt-BR`, `en` e
`x-default`) — listado só de um lado, o Google ignora o par inteiro. O
`public/sitemap.xml` traz as duas URLs com os mesmos alternates.

### O favicon

`public/favicon.png` (32×32) e `public/logo.png` (512×512) saem os dois do
mesmo lugar: `src/assets/logo.png`, a arte original em 1254×1254. Esse arquivo
não é servido — mora ali só para dar de onde regerar.

O enquadramento é a parte que dá trabalho, e centrar pela caixa da imagem
**não** funciona aqui. Duas razões, as duas mensuráveis:

- a arte vem **93px deslocada para a esquerda** no arquivo original;
- e ela é desequilibrada de propósito — o topo é vapor fino (7% a 23% de tinta
  por faixa) e a base é a tigela sólida (62% a 80%). O **centroide do alfa fica
  em y=63,9%**, quase 14 pontos abaixo do centro geométrico.

O navegador centraliza a *caixa* do ícone, então centrar pela caixa deixa a
massa visual quase 14% mais baixa que o texto da aba: o ícone parece afundado
ao lado do "SOPA". Some a isso a arte encostando nas bordas — todo outro
favicon da barra tem folga, e sem ela este lê como grande demais.

A receita corrige as duas coisas: **12% de folga** de cada lado e **metade** da
correção de centroide. Metade, e não ela toda: corrigindo 100% o ícone sobe
demais, passa a flutuar acima da linha do texto e o vapor volta a encostar no
topo. Vale comparar os casos lado a lado numa barra de abas de mentira antes de
mudar esses números.

```python
import numpy as np
from PIL import Image

MARGIN, LIFT = 0.12, 0.5

im = Image.open('src/assets/logo.png').convert('RGBA')
art = im.crop(im.getchannel('A').getbbox())
w, h = art.size

# centroide do alfa: onde a tinta realmente está, não onde a caixa está
ys, xs = np.nonzero(np.array(art.getchannel('A')) > 8)
cy, cx = ys.mean() / h, xs.mean() / w

side = int(round(h / (1 - 2 * MARGIN)))
sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
sq.paste(art, (int(round((side - w) / 2 - (cx - 0.5) * w)),
               int(round((side - h) / 2 - LIFT * (cy - 0.5) * h))))

sq.resize((32, 32), Image.LANCZOS).save('public/favicon.png', optimize=True)
big = sq.resize((512, 512), Image.LANCZOS)
big.quantize(colors=32, method=Image.FASTOCTREE).convert('RGBA').save(
    'public/logo.png', optimize=True
)
```

> **Trocando a logo, remeça o centroide.** `MARGIN` e `LIFT` foram escolhidos
> para *esta* arte. Uma logo equilibrada tem centroide perto de 50% e o `LIFT`
> deixa de fazer diferença; uma pesada no topo pede lift negativo. Quem manda é
> o número medido, não o palpite.

O 512 é quantizado em 32 cores e o 32 não: é pixel art de cor plana, então a
paleta curta tira 8x do peso (122 KB → 15 KB) sem diferença visível — e na
escala de 32px, onde cada pixel conta, não vale arriscar a nuance por 2 KB.

O `logo.png` serve o `apple-touch-icon` e o `"logo"` do JSON-LD, que antes
apontava para o `og.jpg` — um print da home, não uma marca.

> **A 16px o desenho embola.** Os dois fios de vapor viram um borrão só e o
> pires se perde; ainda lê como tigela fumegando, que é o suficiente para uma
> aba, mas não espere ver os grãos. Por isso o `sizes="32x32"` declarado: em
> tela de alta densidade o browser pega o 32 e o desenho se sustenta.

### A imagem de preview

`public/og.jpg` é um **print da home de verdade**, não uma arte à parte: a
palavra, o feixe e as estrelas, sem o resto da interface. Refazer, quando o
hero mudar:

```bash
pnpm build && pnpm preview --port 4180
node scripts/og.mjs            # escreve scripts/.og-raw.png em 2400×1260
```

e reduzir para 1200×630 salvando como **JPEG**:

```python
from PIL import Image
Image.open('scripts/.og-raw.png').convert('RGB')   .resize((1200, 630), Image.LANCZOS)   .save('public/og.jpg', 'JPEG', quality=88, optimize=True, progressive=True)
```

O `scripts/og.mjs` dirige um Chromium headless pelo DevTools Protocol, **sem
dependência nenhuma**: usa o Chrome ou Edge que já está instalado e o
`WebSocket` global do Node 22+. Puppeteer faria o mesmo em menos linhas e
custaria ~300 MB de navegador baixado para um script que roda quando o hero
muda. Os números que ele aplica, e por quê:

- **captura em 2400×1260** (`deviceScaleFactor: 2`) e reduz depois — dá
  antisserrilhado melhor do que capturar direto no tamanho final;
- **espera 7s** antes do disparo: o canvas do feixe entra com fade de 1,8s e a
  linha central oscila devagar, então o quadro bonito não é o primeiro;
- **força `font-size: 33vw`** na span da marca. Ela é dimensionada por
  `min(36vw, 30vh)`, e num quadro 1200×630 quem manda é o `vh`: sairia com
  189px, pequena demais para uma miniatura de link. O tamanho vai na span, e
  não no `h1` — a classe dela ganharia do pai.

> **O que ele esconde, e as duas armadilhas.** Vale ir pela estrutura e não por
> classe: as classes do Tailwind mudam a cada ajuste de layout, o esqueleto
> (canvas de fundo mais o `h1` no meio) não. Mas "é um `canvas`" não basta —
> **o feixe mora dentro de um `div`**, e a primeira versão do script o escondeu
> junto, entregando um quadro só com as estrelas. E manter o wrapper do `h1`
> traz os **botões e o "Agency"** junto: os dois penduram num `top-full`, um
> como irmão do `h1` e outro como filho dele.

> **Por que JPEG.** O mesmo quadro em PNG passa de 400 KB, e o WhatsApp costuma
> desistir do preview acima de uns 300 KB. Em JPEG são 45 KB — o card preto de
> hoje comprime melhor que o degradê cinza de antes, que dava 77 KB. Num quadro
> quase todo escuro não aparece banda: o grão que o shader já joga por cima
> segura isso. Trocar para PNG custa o preview no lugar onde ele mais é usado.

## Tema

`src/index.css` concentra as decisões visuais no bloco `@theme`:

- **cores** — `hero-top/mid/bot` (fundo do card, hoje preto; era um degradê
  cinza), `frame` (preto do fundo),
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

- não há analytics, formulário de contato nem testes

Tema claro **não** está na lista: o toggle saiu do menu de propósito. O
`LightBeam` acumula cor partindo do preto e soma luz com blend `SRC_ALPHA` —
sobre fundo claro ele não clareia, pinta um retângulo escuro com riscos. O
`Starfield` tem o mesmo problema, e o `--color-stroke` da palavra gigante está
calibrado para o degradê do card. Tema claro é reescrever os shaders, não trocar
tokens; se um dia for pedido, `prefers-color-scheme` resolve sem botão.
