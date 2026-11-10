import { Router } from 'express'
import { z } from 'zod'
import { autenticarUsuario, alterarSenha, exigirAcessoGlobal, exigirAutenticacao, listarUsuariosPublicos } from '../services/authService.js'
import { preVisualizarChamado, gravarChamado, desfazerGravacao, sincronizarPlanilha, listarAbas, dashboardSarah, detalhesAnalista } from '../controllers/chamadoController.js'
import { validarRequisicao } from '../middlewares/validateRequest.js'
import { esquemaTextoEntrada, esquemaChamadoEstruturado } from '../schemas/chamadoSchema.js'
import { limitadorRequisicoes } from '../middlewares/rateLimiter.js'

const roteador = Router()
const esquemaGravacaoFinal = z.object({ dados: esquemaChamadoEstruturado, username: z.string().optional() })

roteador.post('/auth/login', limitadorRequisicoes, async (requisicao, resposta) => {
  try {
    const { username, senha } = requisicao.body || {}
    const resultado = await autenticarUsuario(String(username || '').trim().toLowerCase(), senha)
    if (!resultado) return resposta.status(401).json({ erro: 'UsuÃ¡rio ou senha invÃ¡lidos.' })
    return resposta.json(resultado)
  } catch (erro) {
    return resposta.status(500).json({ erro: erro.message || 'Falha ao autenticar.' })
  }
})

roteador.get('/auth/me', exigirAutenticacao, (requisicao, resposta) => resposta.json({ usuario: requisicao.usuario }))

roteador.post('/auth/alterar-senha', exigirAutenticacao, async (requisicao, resposta) => {
  try {
    const token = await alterarSenha(requisicao.usuario.sub, requisicao.body?.novaSenha)
    return resposta.json({ token, mensagem: 'Senha alterada com sucesso.' })
  } catch (erro) {
    return resposta.status(400).json({ erro: erro.message })
  }
})

roteador.get('/auth/usuarios', exigirAutenticacao, exigirAcessoGlobal, async (requisicao, resposta) => {
  return resposta.json({ usuarios: await listarUsuariosPublicos() })
})

roteador.get('/dashboard', exigirAutenticacao, exigirAcessoGlobal, dashboardSarah)
roteador.get('/dashboard/analistas/:username', exigirAutenticacao, exigirAcessoGlobal, detalhesAnalista)

roteador.use(exigirAutenticacao)
roteador.get('/abas', listarAbas)
roteador.post('/previsualizar', limitadorRequisicoes, validarRequisicao(esquemaTextoEntrada.extend({ username: z.string().optional() })), preVisualizarChamado)
roteador.post('/gravar', limitadorRequisicoes, validarRequisicao(esquemaGravacaoFinal), gravarChamado)
roteador.post('/desfazer', desfazerGravacao)
roteador.get('/sincronizar', sincronizarPlanilha)

export default roteador
