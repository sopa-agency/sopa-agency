# Logos das marcas atendidas

Um arquivo por marca, nomeado pelo **slug** — minúsculas, sem acento, hífen no
lugar de espaço. É o mesmo padrão do `src/assets/trabalhos/`, e pela mesma
razão: o componente acha o arquivo pelo slug, então publicar uma marca nova é
soltar o arquivo aqui e citar o slug em `marcas.itens`, nas duas locales.

**Marca sem arquivo não deixa buraco**: o card mostra só o nome e segue de pé.

## Os logos aparecem EM COR

A cor da marca é o ponto da faixa, então o componente não aplica filtro nenhum.
Todo o tratamento acontece na imagem, e são três passos — nesta ordem:

**1. Fundo transparente.** Quem já tem alfa é só recortado pela caixa dele.
Quem vem chapado tem o fundo tirado por cor, usando o pixel do canto como
chave e uma tolerância curta, para não comer detalhe escuro do próprio desenho.

> Os quatro arquivos chapados daqui vinham com fundo **quase preto** (10 a 35),
> e não branco. Era por isso que sumiam no site antes de serem tratados: um
> retângulo escuro sobre fundo escuro não tem como ser visto.

**2. Quase-preto sem saturação vira branco.** Marca preta sobre fundo preto não
tem cor para mostrar; o que existe é a variante clara, que é o que toda marca
publica para fundo escuro. A PUMA chega inteira assim, e a palavra "HBO" do
HBOmax também.

Só o que é quase-preto **e** dessaturado muda — a saturação é o que separa
"preto do logo" de "azul escuro do logo". Por isso o degradê do "max" e o
laranja do Burger King passam intactos.

> **Guarda importante:** se o arquivo já tem branco em quantidade (mais de 8%
> dos pixels opacos), ele JÁ é a variante de fundo escuro, e o preto ali é o
> fundo do próprio logo — não a tinta. Sem essa guarda, o KeepKey (texto branco
> num quadrado preto) virava um quadrado branco chapado.

**3. Recorte rente e 240px de altura**, sem ampliar: arquivo menor que isso
fica no tamanho que tem, porque esticar não devolve nitidez e o card desenha em
~18px de qualquer forma.

O script fica em `scratchpad` por ser de uso único — rodar de novo só faz
sentido quando entrar logo novo, e aí vale reler os três passos acima antes.

## O que um arquivo novo precisa ter

**Fundo separável.** Ou alfa de verdade, ou um fundo de cor uniforme. PNG
achatado sobre foto não tem como ser recortado por cor.

**Altura útil de pelo menos 200px.** O card desenha em ~18px, e em tela de alta
densidade são 36px reais. `odysee` e `shapeshift` vieram em 37×34 e 46×42, que é
o mínimo que ainda passa — se der para pedir maiores, peça.

**Nada de margem embutida.** O HBO original vinha 3000×3000 com 93% de área
vazia. O recorte pela caixa do alfa resolve, mas partir de um arquivo rente é
sempre melhor.
