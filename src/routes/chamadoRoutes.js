import { Router } from 'express'
import { z } from 'zod'
import { autenticarUsuario, alterarSenha, exigirAcessoDashboard, exigirAcessoGlobal, exigirAutenticacao, listarUsuariosPublicos } from '../services/authService.js'
import { preVisualizarChamado, gravarChamado, desfazerGravacao, sincronizarPlanilha, listarAbas, dashboardSarah, detalhesAnalista } from '../controllers/chamadoController.js'
import { validarRequisicao } from '../middlewares/validateRequest.js'
import { esquemaTextoEntrada, esquemaChamadoEstruturado, esquemaUsername } from '../schemas/chamadoSchema.js'
import { limitadorAutenticacao, limitadorRequisicoes } from '../middlewares/rateLimiter.js'

const roteador = Router()
const esquemaGravacaoFinal = z.object({ dados: esquemaChamadoEstruturado, username: esquemaUsername.optional() })

roteador.post('/auth/login', limitadorAutenticacao, async (requisicao, resposta) => {
  try {
    const { username, senha } = requisicao.body || {}
    const resultado = await autenticarUsuario(String(username || '').trim().toLowerCase(), senha)
    if (!resultado) return resposta.status(401).json({ erro: 'Os dados informados \u00e3o conferem. Verifique usu\u00e1rio e senha.' })
    if (!resultado) return resposta.status(401).json({ erro: 'Os dados informados não conferem. Verifique usuário e senha.' })
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

roteador.get('/dashboard', exigirAutenticacao, exigirAcessoDashboard, dashboardSarah)
roteador.get('/dashboard/analistas/:username', exigirAutenticacao, exigirAcessoDashboard, detalhesAnalista)

roteador.use(exigirAutenticacao)
roteador.get('/abas', listarAbas)
roteador.post('/previsualizar', limitadorRequisicoes, validarRequisicao(esquemaTextoEntrada.extend({ username: esquemaUsername.optional() })), preVisualizarChamado)
roteador.post('/gravar', limitadorRequisicoes, validarRequisicao(esquemaGravacaoFinal), gravarChamado)
roteador.post('/desfazer', desfazerGravacao)
roteador.get('/sincronizar', sincronizarPlanilha)

export default roteador
