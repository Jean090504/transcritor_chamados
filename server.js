import express from 'express'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'
import { configuracaoAmbiente } from './src/config/env.js'
import rotasChamado from './src/routes/chamadoRoutes.js'

const caminhoArquivoAtual = fileURLToPath(import.meta.url)
const diretorioAtual = path.dirname(caminhoArquivoAtual)

const aplicacaoServidor = express()

aplicacaoServidor.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"]
      }
    }
  })
)

aplicacaoServidor.use(express.json({ limit: '50kb' }))

// Servir arquivos estáticos (CSS, JS)
aplicacaoServidor.use(express.static(path.join(diretorioAtual, 'public')))

// Rotas da API
aplicacaoServidor.use('/api', rotasChamado)

aplicacaoServidor.get('/api/status', (requisicao, resposta) => {
  resposta.json({ status: 'API operacional' })
})

// Rota coringa para entregar a interface principal
aplicacaoServidor.get('*', (requisicao, resposta) => {
  resposta.sendFile(path.join(diretorioAtual, 'public', 'views', 'index.html'))
})

const PORTA = configuracaoAmbiente?.PORTA || process.env.PORT || 3000

if (!process.env.VERCEL) {
  aplicacaoServidor.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`)
  })
}

export default aplicacaoServidor