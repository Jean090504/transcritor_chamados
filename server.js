import express from 'express'
import helmet from 'helmet'
import { configuracaoAmbiente } from './src/config/env.js'
import rotasChamado from './src/routes/chamadoRoutes.js'

const aplicacaoServidor = express()

aplicacaoServidor.use(helmet())
aplicacaoServidor.use(express.json({ limit: '50kb' }))

// Rotas da API
aplicacaoServidor.use('/api', rotasChamado)

// Rota de status/saúde
aplicacaoServidor.get('/api/status', (requisicao, resposta) => {
  resposta.json({ status: 'API operacional' })
})

if (process.env.NODE_ENV !== 'production') {
  aplicacaoServidor.listen(configuracaoAmbiente.PORTA, () => {
    console.log(`Servidor rodando na porta ${configuracaoAmbiente.PORTA}`)
  })
}

export default aplicacaoServidor
