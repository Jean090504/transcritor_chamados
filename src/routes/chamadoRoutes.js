import { Router } from 'express'
import { z } from 'zod'
import { autenticarUsuario, alterarSenha, exigirAcessoDashboard, exigirAcessoGlobal, exigirAutenticacao, listarUsuariosPublicos } from '../services/authService.js'
import { preVisualizarChamado, gravarChamado, desfazerGravacao, sincronizarPlanilha, listarAbas, dashboardSarah, detalhesAnalista } from '../controllers/chamadoController.js'
import { validarRequisicao } from '../middlewares/validateRequest.js'
import { esquemaTextoEntrada, esquemaChamadoEstruturado, esquemaUsername, esquemaLogin, esquemaNovaSenha } from '../schemas/chamadoSchema.js'
import { limitadorAutenticacao, limitadorRequisicoes } from '../middlewares/rateLimiter.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'

const roteador = Router()
const esquemaGravacaoFinal = z.object({ dados: esquemaChamadoEstruturado, username: esquemaUsername.optional() })
const esquemaDesfazer = z.object({ id: z.string().uuid(), username: esquemaUsername.optional() })
const esquemaSincronizar = z.object({ username: esquemaUsername.optional() })

roteador.post('/auth/login', limitadorAutenticacao, validarRequisicao(esquemaLogin), async (requisicao, resposta) => {
  try {
    const { username, senha } = requisicao.body || {}
    const resultado = await autenticarUsuario(username, senha)
    if (!resultado) return resposta.status(401).json({ erro: 'Os dados informados \u00e3o conferem. Verifique usu\u00e1rio e senha.' })
    if (!resultado) return resposta.status(401).json({ erro: 'Os dados informados não conferem. Verifique usuário e senha.' })
    return resposta.json(resultado)
  } catch (erro) {
    console.error('Falha na autenticaÃ§Ã£o:', erro)
    return resposta.status(500).json({ erro: 'Falha ao autenticar.' })
  }
})

roteador.get('/auth/me', exigirAutenticacao, (requisicao, resposta) => resposta.json({ usuario: requisicao.usuario }))

roteador.post('/auth/alterar-senha', exigirAutenticacao, validarRequisicao(esquemaNovaSenha), async (requisicao, resposta) => {
  try {
    const token = await alterarSenha(requisicao.usuario.sub, requisicao.body?.novaSenha)
    return resposta.json({ token, mensagem: 'Senha alterada com sucesso.' })
  } catch (erro) {
    console.error('Falha ao alterar senha:', erro)
    return resposta.status(500).json({ erro: 'Falha ao alterar a senha.' })
  }
})

roteador.get('/auth/usuarios', exigirAutenticacao, exigirAcessoGlobal, asyncHandler(async (requisicao, resposta) => {
  return resposta.json({ usuarios: await listarUsuariosPublicos() })
}))

roteador.get('/dashboard', exigirAutenticacao, exigirAcessoDashboard, asyncHandler(dashboardSarah))
roteador.get('/dashboard/analistas/:username', exigirAutenticacao, exigirAcessoDashboard, asyncHandler(detalhesAnalista))

roteador.use(exigirAutenticacao)
roteador.get('/abas', asyncHandler(listarAbas))
roteador.post('/previsualizar', limitadorRequisicoes, validarRequisicao(esquemaTextoEntrada.extend({ username: esquemaUsername.optional() })), preVisualizarChamado)
roteador.post('/gravar', limitadorRequisicoes, validarRequisicao(esquemaGravacaoFinal), gravarChamado)
roteador.post('/desfazer', validarRequisicao(esquemaDesfazer), desfazerGravacao)
roteador.get('/sincronizar', validarRequisicao(esquemaSincronizar, 'query'), asyncHandler(sincronizarPlanilha))

export default roteador
