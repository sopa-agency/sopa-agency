# Logos das marcas atendidas

Um arquivo por marca, nomeado pelo **slug** — minúsculas, sem acento, hífen no
lugar de espaço. É o mesmo padrão do `src/assets/trabalhos/`, e pela mesma
razão: o componente acha o arquivo pelo slug, então publicar uma marca nova é
soltar o arquivo aqui e citar o slug na copy.

| slug | marca |
| --- | --- |
| `burger-king` | Burger King |
| `c-a` | C&A |
| `gnars` | Gnars |
| `hbo` | HBO |
| `keepkey` | KeepKey |
| `odysee` | Odysee |
| `puma` | Puma |
| `shapeshift` | ShapeShift |
| `skatehive` | SkateHive |

## O que um arquivo aqui precisa ter

**Fundo transparente.** A faixa corre sobre preto, e logo em caixa branca vira
um retângulo aceso no meio da fila. PNG ou SVG com alfa; `.jpg` não serve.

**Altura útil de pelo menos 200px.** A faixa desenha as marcas em ~28px de
altura, e em telas de alta densidade isso são 56px reais — abaixo de 200px de
origem a redução não tem de onde tirar nitidez.

**Nada de margem embutida.** Logo com muito respiro dentro do próprio arquivo
desalinha a fila, porque o espaçamento passa a ser o do arquivo e não o do
layout. Corte rente ao desenho.

> **Peso.** Estes arquivos vão para o bundle. Um logo de faixa não tem por que
> passar de ~20 KB: reduza para uns 240px de altura e salve como `.webp` ou
> `.svg` antes de commitar. Ver o `og.mjs` em `scripts/` para o mesmo raciocínio
> aplicado à imagem de preview.

## Estado do que está aqui hoje

Nem todos servem como estão:

| arquivo | tamanho | problema |
| --- | --- | --- |
| `odysee.png` | 37×34 | **pequeno demais** — borra em qualquer escala de faixa |
| `shapeshift.png` | 46×42 | **pequeno demais** |
| `skatehive.png` | 160×155 | no limite; aceitável em faixa baixa |
| `hbo.png` | 3000×3000, 311 KB | grande demais para o bundle |
| `keepkey.png` | 2560×2608, 513 KB | grande demais para o bundle |
| `gnars.jpg` | 1000×1000 | **`.jpg`, sem alfa** — vai aparecer com fundo |

Os dois primeiros precisam ser baixados de novo numa resolução maior; os dois
grandes, reduzidos; o `gnars` refeito com transparência (ou reaproveitado do
`trabalhos/gnars.webp`, que é print do site e não logo).
