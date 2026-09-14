# Depoimentos — rascunho para aprovação

Nenhuma destas frases está no site. São propostas de texto para enviar ao
contato de cada marca: ele aprova, ajusta ou reescreve, e só então a fala entra
no `marcas.itens[].depoimento` dos dois `content.*.ts` — com o nome de quem
assina.

Tamanho calibrado para as três linhas do card em 300px (≈ 130 caracteres).

## Modelo de e-mail

> Oi, [nome]. Estou montando a página nova da SOPA e queria colocar uma linha
> sobre o nosso trabalho junto. Escrevi uma sugestão abaixo para não te dar
> trabalho — corta, muda ou escreve do zero, o que for verdade. Posso usar com
> o seu nome e cargo?

## Sugestões

| Marca | Frase sugerida |
|---|---|
| HBO | "Prazo apertado e escopo grande. Entregaram no dia, e sem a gente precisar ficar em cima." |
| Puma | "Entenderam a marca na primeira conversa. O que voltou já estava no tom certo." |
| Burger King | "Time pequeno e rápido. Pedido de manhã, versão pronta à tarde." |
| C&A | "Organizaram o que estava espalhado e devolveram uma coisa só, clara." |
| KeepKey | "Técnicos de verdade. Resolveram do design ao código sem passar o problema adiante." |
| ShapeShift | "Fácil de trabalhar junto. Perguntam o que precisa ser perguntado e tocam sozinhos." |
| Gnars | "Pegaram uma ideia solta e transformaram em produto no ar." |
| Odysee | "Ficaram depois do lançamento. Isso quase ninguém faz." |
| SkateHive | "Rápidos, diretos e sem enrolação de agência." |

## Ao publicar

- Cada item vira `{ slug, nome, depoimento, autor }` — o autor é o que separa
  depoimento de frase solta. Mexer no `Marcas.tsx` para renderizar a assinatura.
- Traduzir a fala aprovada no `content.en.ts` (não inventar variação nova lá).
- Marca sem resposta continua com o `espera`; a faixa aguenta os dois estados.
