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
        connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"]
      }
    }
  })
)

aplicacaoServidor.use(express.json({ limit: '50kb' }))

aplicacaoServidor.use(express.static(path.join(diretorioAtual, 'public')))

aplicacaoServidor.use('/api', rotasChamado)

aplicacaoServidor.get('/api/status', (requisicao, resposta) => {
  resposta.json({ status: 'API operacional' })
})

aplicacaoServidor.get('*', (requisicao, resposta) => {
  resposta.sendFile(path.join(diretorioAtual, 'public', 'views', 'index.html'))
})

if (process.env.NODE_ENV !== 'production') {
  aplicacaoServidor.listen(configuracaoAmbiente.PORTA, () => {
    console.log(`Servidor rodando na porta ${configuracaoAmbiente.PORTA}`)
  })
}

export default aplicacaoServidor