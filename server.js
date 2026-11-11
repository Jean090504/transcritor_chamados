import express from 'express'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'
import { configuracaoAmbiente } from './src/config/env.js'
import rotasChamado from './src/routes/chamadoRoutes.js'
import { limitadorApi } from './src/middlewares/rateLimiter.js'

const caminhoArquivoAtual = fileURLToPath(import.meta.url)
const diretorioAtual = path.dirname(caminhoArquivoAtual)

const aplicacaoServidor = express()

// O Vercel encaminha as requisições por proxy e informa o IP original neste cabeçalho.
aplicacaoServidor.set('trust proxy', 1)

aplicacaoServidor.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"]
      }
    }
  })
)

aplicacaoServidor.use(express.json({ limit: '50kb' }))

// Servir arquivos estáticos (CSS, JS)
aplicacaoServidor.use(express.static(path.join(diretorioAtual, 'public')))

aplicacaoServidor.get('/api/status', (requisicao, resposta) => {
  resposta.json({ status: 'API operacional' })
})

// Rotas da API
aplicacaoServidor.use('/api', limitadorApi, rotasChamado)

aplicacaoServidor.use((erro, requisicao, resposta, proximo) => {
  if (resposta.headersSent) return proximo(erro)
  console.error('Erro interno na API:', erro)
  return resposta.status(500).json({ sucesso: false, erro: 'Erro interno do servidor.' })
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
