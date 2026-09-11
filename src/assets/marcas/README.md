# Logos das marcas atendidas

Um arquivo por marca, nomeado pelo **slug** — minúsculas, sem acento, hífen no
lugar de espaço. É o mesmo padrão do `src/assets/trabalhos/`, e pela mesma
razão: o componente acha o arquivo pelo slug, então publicar uma marca nova é
soltar o arquivo aqui e citar o slug em `marcas.itens`, nas duas locales.

**Marca sem arquivo não deixa buraco**: a faixa escreve o nome em texto e
segue. É por isso que dá para publicar a lista antes de ter todos os logos.

## Os arquivos daqui são brancos sobre transparente

E isso é feito na IMAGEM, não em filtro de CSS. Os originais vêm em registros
incompatíveis entre si:

- uns são **pretos sobre alfa** (PUMA, C&A, HBO) — o desenho está no recorte;
- outros trazem o desenho **na cor**, com o alfa servindo só de contorno
  externo (Burger King, KeepKey).

Nenhum filtro unifica os dois. `brightness-0 invert` achata o segundo grupo em
bolha sólida, porque a silhueta deles não é o logo; `grayscale` apaga o
primeiro, porque preto continua preto sobre preto. Foram as duas tentativas
antes desta, e as duas quebravam metade da fila.

A conversão resolve caso a caso: mede a luminância média da tinta e decide de
onde tirar o novo alfa — do inverso da luminância quando a tinta é escura, da
própria quando é clara —, sempre multiplicado pelo alfa original para não
ressuscitar o que já era recorte. A saída é branca, recortada rente e com 240px
de altura.

```python
im = Image.open(f).convert('RGBA')
arr = np.array(im, dtype=float)
a = arr[..., 3] / 255
lum = (0.2126 * arr[..., 0] + 0.7152 * arr[..., 1] + 0.0722 * arr[..., 2]) / 255

tinta_clara = (lum * a).sum() / max(a.sum(), 1.0) > 0.5
novo_a = a * (lum if tinta_clara else (1 - lum))

saida = np.zeros(arr.shape, dtype=np.uint8)
saida[..., 0:3] = 255
saida[..., 3] = (np.clip(novo_a, 0, 1) * 255).astype(np.uint8)
```

Depois disso o CSS não precisa de filtro nenhum — só da opacidade que põe todos
no mesmo tom.

## O que um arquivo novo precisa ter

**Transparência que signifique alguma coisa.** Ou o recorte é o desenho, ou a
cor é. Um PNG achatado sobre fundo branco não tem como virar marca branca.

**Altura útil de pelo menos 200px.** A faixa desenha em ~32px, e em tela de alta
densidade isso são 64px reais.

**Nada de margem embutida.** O HBO original vinha 3000×3000 com 93% de área
vazia, e saía minúsculo na fila porque a redução respeitava a moldura do
arquivo. A conversão recorta pela caixa do alfa justamente por isso, mas partir
de um arquivo rente é sempre melhor.

## `_pendentes/`

Arquivos que **não dá** para usar como estão. O glob da faixa não varre
subpasta, então eles ficam guardados aqui sem aparecer no site:

| arquivo | problema | o que trazer no lugar |
| --- | --- | --- |
| `gnars.jpg` | `.jpg`, sem canal alfa | PNG ou SVG com fundo transparente |
| `odysee.png` | 37×34, 0% de transparência | mesmo logo em ≥200px de altura, recortado |
| `shapeshift.png` | 46×42, 0% de transparência | idem |
| `skatehive.png` | 160×155, 0% de transparência | idem |

Enquanto não chegarem, as quatro aparecem na faixa como nome escrito.
