# Prints dos trabalhos

Salve o print de cada site aqui com o **slug** que está em `src/data/content.ts`
(`services.works`) como nome do arquivo:

| slug            | site                       | arquivo esperado          |
| --------------- | -------------------------- | ------------------------- |
| `nogglesboard`  | https://www.nogglesboard.wtf/ | `nogglesboard.png`     |
| `gnars`         | https://gnars.com/         | `gnars.png`               |
| `swaps`         | https://www.swaps.pro/     | `swaps.png`               |
| `slop`          | https://www.slop.fi/       | `slop.png`                |

`.png`, `.jpg`, `.webp`, `.avif` e `.gif` funcionam — o componente acha pelo slug.
Basta soltar o arquivo aqui: nada mais precisa ser editado.

O recorte é **16:10 deitado**, cortado a partir do topo. Um print de janela em
1440×900 já cai certo. Prefira `.webp` — pesa uns 70% menos que `.png`.

Só um arquivo por slug: se houver dois, quem ganha é o primeiro em ordem
alfabética, e não dá para saber qual olhando a página.

O nome do arquivo é o slug, não o do site: o de `swaps.pro` chama `swaps.mp4`,
porque `swaps` é o que está no `content.ts`. Fora disso o componente não acha e
cai no placeholder sem avisar.

## Trabalho em movimento

Solte um `.mp4` com o slug e ele toca em laço, sem som, com a imagem de mesmo
slug servindo de cartaz enquanto carrega. Nada mais precisa ser editado.

**Não use GIF para isso.** Os quatro clipes daqui pesavam 14,8 MB em GIF e
pesam 0,45 MB em MP4 — trinta vezes menos, com todas as cores e sem o ruído
que o GIF cria em degradê. Para converter, com ffmpeg:

```bash
ffmpeg -i entrada.gif -movflags +faststart -pix_fmt yuv420p \
  -vf "hqdn3d=1.5:1.5:6:6" -c:v libx264 -crf 30 -preset veryslow -an slug.mp4
```

O `hqdn3d` limpa o chuvisco que a paleta de 256 cores do GIF deixou; sem ele o
arquivo sai bem maior, porque ruído não comprime.
