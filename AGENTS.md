# sopa-agency

Site institucional da SOPA — estúdio de criação e engenharia. Página única em
português, fundo escuro, hero em WebGL conduzido por scroll.

Este repositório era um app Next.js com rotas por locale, API routes e espelho
markdown. Não é mais: o frontend inteiro foi substituído pelo one-pager em Vite.
Se a sua memória diz Next.js, `src/app/`, `[locale]` ou `LayoutClient`, está
desatualizada — nada disso existe aqui.

## Atribuição — REGRA ABSOLUTA

Nunca cite, mencione ou referencie Claude, Anthropic, "AI", "IA", "gerado por IA"
ou qualquer assistente em **nada** deste repositório. Isso vale para, sem exceção:

- mensagens de commit (sem `Co-Authored-By`, sem trailer de sessão, sem "Generated with")
- títulos e corpo de Pull Requests
- comentários de código, docstrings, TODOs
- CHANGELOG, release notes, documentação
- nomes de branch

O autor de todo o trabalho é o dono do repositório. Escreva como ele escreveria.
`includeCoAuthoredBy` já está desligado em `.claude/settings.json`; mantenha assim.

## Stack

Vite 8 + React 19 + TypeScript + Tailwind CSS v4. Gerenciador: **pnpm**
(fixado em `packageManager`). Lint: oxlint. Sem roteador, sem CMS, sem backend.

```bash
pnpm dev     # http://localhost:5173
pnpm build   # tsc -b && vite build
pnpm lint
```

## Deploy

Vercel, a partir do `vercel.json` — e ele precisa existir. O projeto na Vercel
foi criado quando isto aqui era Next.js, e o preset de framework lá continua
Next: sem o `"framework": "vite"` do arquivo, o build morre em
`No Next.js version detected` depois de instalar tudo direitinho. As chaves do
`vercel.json` têm precedência sobre as configurações do painel, então o conserto
mora no repositório e não em quem apertar deploy. Não apague o arquivo.

## Idioma

O site tem **duas locales**: português em `/` e inglês em `/en/`. São duas
páginas estáticas de verdade, não um estado do React — cada uma tem o seu
`index.html` com `<head>`, `lang` e canonical próprios, e o `vite.config.ts` as
declara como duas entradas do mesmo build.

Quem escolhe a copy é o `lang` do documento: o `src/data/content.ts` lê
`document.documentElement.lang` na inicialização do módulo (o
`<script type="module">` é deferred, então o `<html>` já foi parseado) e
reexporta `content.pt.ts` ou `content.en.ts`. Os componentes seguem importando
`nav`, `hero`, `services`… pelo nome e não sabem de locale nenhuma.

Não adicione biblioteca de i18n nem chave de tradução: são dois objetos de
texto estático, e uma lib seria mais código que o problema. **Mexeu numa
locale, mexa na outra** — as duas têm a mesma forma, e os valores estruturais
(`accent`, `visual`, `icon`, `slug`, `href` de âncora) são idênticos nas duas.
Só a prosa e as mensagens de WhatsApp mudam.

O `satisfies Record<keyof typeof pt, unknown>` no fim do `content.en.ts` cobra
as chaves de primeiro nível: esquecer uma seção inteira quebra o build. Chave de
prosa que falte não é pega ali — aparece como texto vazio ao abrir o `/en/`.

## Convenções

**Toda a copy vive em `src/data/content.pt.ts` e `src/data/content.en.ts`**,
por seção (`nav`, `hero`, `services`, `faq`, `footer`). Componentes não têm
texto embutido — nem `aria-label`, nem placeholder. Para mudar qualquer palavra
do site, mexa nesses dois arquivos e em mais nada. O `content.ts` é só o
seletor de locale; o número de WhatsApp e o `waLink` moram no `contact.ts`,
porque o número é o mesmo nas duas e as mensagens não.

**A narrativa que atravessava o card do hero não existe mais.** Ela era vinte
linhas monoespaçadas numa coluna magra dentro de um vazio preto, reveladas uma a
uma por um facho de leitura. Virou a seção 02 (`sections/Metodo.tsx`): texto
parado com hierarquia de verdade e um painel ao lado que PROVA o argumento em
vez de só afirmá-lo. Com ela foram embora o `HeroStory`, o `@utility
line-reading`, o `--animate-caret` e a metade do `useHeroScroll` que media linha
por linha. Se a sua memória fala em `hero.story`, `--typed`, `--caret` ou
quebras de 46 caracteres, está desatualizada.

**A seção 02 é um palco preso, como o hero.** Track alto + `sticky` dentro
dele, e o conteúdo sobe por DENTRO enquanto o palco está parado. Não é enfeite:
com o palco em movimento o conteúdo não tem contra o que se mover, e o olho lê a
rolagem da página em vez de uma chegada. Foi o que faltou em duas tentativas
antes de chegar aqui. O `useStageProgress` publica o `--enter` desse percurso,
que começa quando o track encosta no pé da tela e termina já com o palco preso —
cobrir os dois trechos é o que faz o conteúdo aparecer subindo e ainda assentar
depois que ele para.

**O card da seção 02 não existe mais.** Era o retângulo de 40px de raio, borda
de 1px, degradê e sombra azul que repetia o objeto do hero. Preto sobre preto, o
que a borda desenhava era a moldura e não o objeto, e a seção lia como um slide
dentro da página em vez de a página continuando. Hoje o conteúdo fica direto
sobre o campo de estrelas, e o que separa esta seção da anterior é a costura de
luz no topo do palco, as estrelas e o vazio.

**Não tente pendurar uma luz colorida no conteúdo** para substituir a borda: já
foi tentado, com o halo do card reancorado no topo do bloco. O halo nunca teve
forma própria — quem a dava era o fio de 2px de cor cheia na aresta, e ele só
punha o brilho atrás. Sem o fio vira um borrão colorido atravessando o alto da
seção; com o fio volta a divisória horizontal, que é o que o card tinha de
errado. Se a sua memória fala no card da 02, na sombra dele, no fio de 2px, no
`overflow-hidden` dele ou numa luz que sobe do conteúdo, está desatualizada.

**A cortina é de quem vem logo depois do hero.** A margem negativa `-mt-[40vh]`,
o `z-10`, o fundo opaco e a sombra para cima moram hoje no `Metodo`. Ela morava
no `Services`, que era quem vinha depois; deixá-la lá fazia a margem negativa
comer 40vh do rodapé da seção nova. Mudou a ordem das seções, a cortina anda
junto.

**A página inteira é preta.** Todas as seções usam `bg-frame`; o
`--color-surface` (`#0c0d0e`) existia só para o fundo cinza da seção de serviços
e saiu junto com ele. O que separa uma seção da outra são as bordas de 1px, o
campo de estrelas e os cards — não tom de fundo. Na seção 02 nem isso: lá o que
separa é a luz que sobe do conteúdo.

**O tema vive no `@theme` de `src/index.css`**, não há `tailwind.config`. Cores,
fontes e keyframes entram lá. Utilitários próprios usam `@utility` (e não
`@layer utilities`), senão não aceitam variantes como `md:`.

**O card do hero é preto, e três coisas ficaram calibradas para o cinza que
ele era:** o efeito de "soltar das bordas" ficou invisível (o `--color-frame`
atrás também é preto), e os alfas do `Starfield` e do `--color-stroke` estão
altos porque foram subidos para vencer o degradê. A lista está por extenso no
`index.css`, junto dos tokens. Não são bugs a consertar de surpresa — são
decisões pendentes; mexer neles é mexer no desenho do hero.

**Os dois painéis não podem ter a mesma forma.** O da seção 02 é uma linha do
tempo, e o da faixa de Automação é um antes/depois em duas colunas. Já foram os
dois a mesma coisa — lista vertical com marcadores ligados por um fio, ao lado
do texto, indo de "conversa" a "no ar" —, e a página lia repetitiva com razão: o
arco aparecia três vezes, contando a primeira pergunta do FAQ. A regra é de
argumento, não de estilo: linha do tempo é a forma de quem argumenta TEMPO (a 02
prova o mesmo dia), e antes/depois é a de quem argumenta COBERTURA (a Automação
responde "cabe na minha operação", e isso se responde com reconhecimento). Ao
criar painel novo, escolha a forma pelo argumento — e confira que nenhum outro
já a usou.

**Uma seção por arquivo** em `src/sections/`, montadas em `App.tsx`.

**Cada CTA tem rótulo próprio, e só o do rodapé tem ícone.** São dois pontos de
contato — hero e rodapé — e já foram cinco: os dois das faixas de serviço saíram
junto com o do menu. A política inteira está no topo do `content.ts`. Três dos
cinco diziam "Entre em contato", e era a repetição da frase, não a quantidade de
botões, que fazia a página soar insistente. Não recrie CTA em seção nova sem ler
essa nota primeiro.

O ícone do WhatsApp segue a mesma lógica: nos quatro ele virava textura, então
ficou só no rodapé, o último ponto, onde saber o canal ajuda quem está
decidindo. Ao acrescentar ou mexer num CTA: o rótulo diz o que acontece a
seguir, nunca é o mesmo de outro botão da página, e o ícone de canal não sai do
rodapé.

**O menu é só navegação.** Quatro links do mesmo padrão, sem CTA no meio —
"Contato" aponta para o `id="contato"` do rodapé, e é lá que está o botão.

**Os canais de contato vivem no `contact.ts`**, não na copy: o número de
WhatsApp e o e-mail são os mesmos nas duas locales. O que muda por idioma são
as mensagens que abrem a conversa e os rótulos, e esses ficam em cada
`content.*.ts`. O número tem 13 dígitos (55 + DDD + 9) — conte antes de trocar,
porque faltando um o `wa.me` não reclama, só abre conversa vazia, e todo CTA do
site vira link morto sem aviso.

**O e-mail é link de texto ao pé do CTA do rodapé, não um segundo botão.**
`mailto:` como botão principal é aposta ruim: quem não tem cliente de e-mail
configurado clica e nada acontece. Como linha discreta serve quem prefere
escrever e não atrapalha quem não usa.

**As meta tags moram nos dois `index.html`.** Sem framework para gerar
`<head>`, o title, a description, o OG e o JSON-LD são escritos à mão em
`index.html` e `en/index.html` — e os robôs de preview de link não executam JS,
então o que eles leem sai de lá, não do React. Mexeu num, mexa no outro: o par
de `hreflang` tem que estar completo nas duas páginas ou o Google ignora o par
inteiro. O `public/sitemap.xml` lista as duas URLs.

**Sem tema claro, e não é pendência.** O toggle de tema saiu do menu de
propósito. O `LightBeam` acumula cor partindo de `vec3(0.0)` e soma luz, com
blend `SRC_ALPHA`: sobre fundo claro ele não clareia, pinta um retângulo escuro
com riscos. O `Starfield` tem o mesmo problema, e o `--color-stroke` da palavra
gigante está calibrado para o degradê do card. Tema claro é reescrever os
shaders, não trocar tokens — se um dia for pedido, `prefers-color-scheme`
resolve sem botão.

## Armadilhas conhecidas

**Translate no Tailwind v4 compõe com `transform` inline.** Os utilitários de
translate usam a propriedade CSS `translate`, que soma ao `transform` em vez de
substituí-lo. Em elementos posicionados por JS (`HeroStory`, dirigido pelo
`useHeroScroll`), não use `-translate-x-1/2` — o deslocamento sai dobrado. Quem
posiciona é o hook.

**Não perca o contexto WebGL no cleanup.** `canvas.getContext('webgl2')` devolve
sempre o mesmo objeto para aquele canvas. Chamar `loseContext()` na limpeza do
efeito quebra a remontagem no StrictMode: o shader não compila mais e a árvore
React cai inteira. O `LightBeam` libera shaders, programa e buffer, e nunca o
contexto.

**`w-screen` conta a barra de rolagem.** O canvas do `Starfield` e o do
`LightBeam` são medidos pela viewport com `w-screen`, e `100vw` inclui os ~15px
da barra — solto, cada um estoura a página e aparece uma barra horizontal. Quem
os usa PRECISA cortá-los: no hero é o `overflow-hidden` do card, e na seção 02 é
um invólucro só para isso — ele nasceu para a sombra do card não ser cortada
junto, e continua necessário depois que o card saiu, porque o palco não recorta
nada. Ao colocar um desses em seção nova, confira o `scrollWidth` antes de
fechar.

**Efeitos de scroll leem a posição a cada frame** e devem funcionar nos dois
sentidos — nada de estado acumulado que só avança.

**O feixe não se dirige por variável CSS.** O `useHeroScroll` publica `--p`,
`--hc` e `--hw` no track, mas a abertura do feixe viaja num ref (`beamRef`) até
o `LightBeam`: quem desenha é um shader, e um uniform não lê `--var`. Buscar a
variável de volta com `getComputedStyle` custaria um cálculo de estilo por
frame. O rodapé não passa o ref — é assim que o feixe de lá fica em repouso.
