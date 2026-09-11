import { inject } from '@vercel/analytics'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Vercel Web Analytics.
 *
 * `inject()` e não o componente `<Analytics />`: o componente existe para
 * avisar o script a cada troca de rota, e aqui não há roteador — `/` e `/en/`
 * são duas páginas estáticas, cada uma com o seu carregamento. Uma chamada no
 * boot cobre as duas, e o painel as separa sozinho pelo caminho.
 *
 * Sem cookie, então não pede banner de consentimento — o que importa porque a
 * página em inglês mira Europa. Em desenvolvimento o script não é carregado; o
 * `mode` é detectado pelo próprio pacote.
 *
 * Precisa estar LIGADO no painel da Vercel (projeto → Analytics → Enable Web
 * Analytics). Sem isso a chamada aqui não faz nada.
 */
inject()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
