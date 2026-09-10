import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /**
   * Duas páginas, e nenhuma rota no cliente. Sem isso o Vite trata o projeto
   * como SPA e devolve o `index.html` para qualquer caminho, então `pnpm dev`
   * e `pnpm preview` responderiam 200 numa URL que em produção é 404 — a
   * Vercel serve arquivo estático e não tem rewrite nenhum. `mpa` alinha os
   * dois, e o 404 volta a aparecer onde se testa.
   */
  appType: 'mpa',
  build: {
    /**
     * Duas entradas, um build. PT em `/` e EN em `/en/`, cada uma com o seu
     * `<head>` escrito à mão — é dele que sai o `lang`, e é o `lang` que o
     * `data/content.ts` lê para escolher a copy.
     *
     * A Vercel serve as duas como arquivo estático, então nada disso precisa
     * de rewrite no `vercel.json`: URL errada continua respondendo 404, que é
     * exatamente o que um SPA fallback estragaria (ver `appType` acima).
     *
     * O bundle de JS é o mesmo nas duas páginas — as duas locales viajam
     * juntas. São alguns KB de texto, e em troca a segunda página abre com o
     * cache já quente.
     */
    rollupOptions: {
      input: {
        pt: 'index.html',
        en: 'en/index.html',
      },
    },
  },
})
