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

O site é **só português**. Não existe versão em inglês: o seletor PT/EN do menu
é maquete e segue `disabled` até haver copy inglesa escrita. Não adicione chaves
de tradução nem estruture conteúdo por locale — a copy é uma string só.

## Convenções

**Toda a copy vive em `src/data/content.ts`**, exportada por seção (`hero`,
`services`, `faq`, `footer`). Componentes não têm texto embutido — para mudar
qualquer palavra do site, mexa só nesse arquivo.

**O tema vive no `@theme` de `src/index.css`**, não há `tailwind.config`. Cores,
fontes e keyframes entram lá. Utilitários próprios usam `@utility` (e não
`@layer utilities`), senão não aceitam variantes como `md:`.

**Uma seção por arquivo** em `src/sections/`, montadas em `App.tsx`.

**As meta tags moram no `index.html`.** Sem framework para gerar `<head>`, o
title, a description, o OG e o JSON-LD são escritos à mão lá — e os robôs de
preview de link não executam JS, então o que eles leem sai de lá, não do React.

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
