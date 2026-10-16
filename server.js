import express from 'express'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { configuracaoAmbiente } from './src/config/env.js'
import rotasChamado from './src/routes/chamadoRoutes.js'

const caminhoArquivoAtual = fileURLToPath(import.meta.url)
const diretorioAtual = path.dirname(caminhoArquivoAtual)

const aplicacaoServidor = express()

aplicacaoServidor.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"]
    }
  }
}))

aplicacaoServidor.use(express.json({ limit: '50kb' }))


aplicacaoServidor.use(express.static(path.join(diretorioAtual, 'src', 'public')))


aplicacaoServidor.use('/api', rotasChamado)

aplicacaoServidor.get('/', (requisicao, resposta) => {
  const caminhoHtml = path.join(diretorioAtual, 'src', 'public', 'views', 'index.html')
  try {
    const conteudoHtml = fs.readFileSync(caminhoHtml, 'utf-8')
    resposta.setHeader('Content-Type', 'text/html; charset=utf-8')
    return resposta.send(conteudoHtml)
  } catch (erro) {
    return resposta.status(500).send(`Erro ao carregar a interface: ${erro.message}`)
  }
})

aplicacaoServidor.get('*', (requisicao, resposta) => {
  const caminhoHtml = path.join(diretorioAtual, 'src', 'public', 'views', 'index.html')
  try {
    const conteudoHtml = fs.readFileSync(caminhoHtml, 'utf-8')
    resposta.setHeader('Content-Type', 'text/html; charset=utf-8')
    return resposta.send(conteudoHtml)
  } catch (erro) {
    return resposta.status(404).send('Página não encontrada.')
  }
})

if (process.env.NODE_ENV !== 'production') {
  aplicacaoServidor.listen(configuracaoAmbiente.PORTA, () => {
    console.log(`Servidor rodando na porta ${configuracaoAmbiente.PORTA}`)
  })
}

export default aplicacaoServidor