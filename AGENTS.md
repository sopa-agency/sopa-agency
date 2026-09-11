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

**As quebras de `hero.story` são estruturais, nas duas locales.** Cada string ali é uma linha de
verdade na tela: é ela que o facho de leitura atravessa, e é ela que acende e
apaga. O corpo é dimensionado em `ch` para a mais longa (46 caracteres) nunca
refluir — refluindo, o facho passa a valer para duas fileiras ao mesmo tempo.
Mexeu na copy, refaça as quebras, e quebre em fim de oração: a linha é lida
sozinha, iluminada, com as vizinhas apagadas.

**O tema vive no `@theme` de `src/index.css`**, não há `tailwind.config`. Cores,
fontes e keyframes entram lá. Utilitários próprios usam `@utility` (e não
`@layer utilities`), senão não aceitam variantes como `md:`.

**Uma seção por arquivo** em `src/sections/`, montadas em `App.tsx`.

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

**Efeitos de scroll leem a posição a cada frame** e devem funcionar nos dois
sentidos — nada de estado acumulado que só avança.

**O feixe não se dirige por variável CSS.** O `useHeroScroll` publica `--p`,
`--hc` e `--hw` no track, mas a abertura do feixe viaja num ref (`beamRef`) até
o `LightBeam`: quem desenha é um shader, e um uniform não lê `--var`. Buscar a
variável de volta com `getComputedStyle` custaria um cálculo de estilo por
frame. O rodapé não passa o ref — é assim que o feixe de lá fica em repouso.
