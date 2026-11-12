import { Router } from 'express'
import { z } from 'zod'
import { autenticarUsuario, alterarSenha, exigirAcessoDashboard, exigirAcessoGlobal, exigirAcessoOperacional, exigirAutenticacao, listarUsuariosPublicos, solicitarResetSenha, listarSolicitacoesReset, aprovarSolicitacaoReset, rejeitarSolicitacaoReset } from '../services/authService.js'
import { preVisualizarChamado, gravarChamado, preVisualizarOperacional, gravarOperacional, desfazerGravacao, sincronizarPlanilha, listarAbas, dashboardSarah, detalhesAnalista } from '../controllers/chamadoController.js'
import { validarRequisicao } from '../middlewares/validateRequest.js'
import { esquemaTextoEntrada, esquemaChamadoEstruturado, esquemaDadosOperacionais, esquemaUsername, esquemaLogin, esquemaNovaSenha } from '../schemas/chamadoSchema.js'
import { limitadorAnalise, limitadorAutenticacao, limitadorGravacao } from '../middlewares/rateLimiter.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'

const roteador = Router()
const esquemaGravacaoFinal = z.object({ dados: esquemaChamadoEstruturado, username: esquemaUsername.optional() })
const esquemaDesfazer = z.object({ id: z.string().uuid(), username: esquemaUsername.optional() })
const esquemaSincronizar = z.object({ username: esquemaUsername.optional() })
const esquemaIdReset = z.object({ id: z.string().uuid() })
const esquemaDataDashboard = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.')
const esquemaPeriodoDashboard = z.object({ inicio: esquemaDataDashboard.optional(), fim: esquemaDataDashboard.optional() }).superRefine((periodo, contexto) => {
  if (Boolean(periodo.inicio) !== Boolean(periodo.fim)) {
    contexto.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe as duas datas do período.' })
    return
  }
  if (periodo.inicio && periodo.fim) {
    const inicio = Date.parse(`${periodo.inicio}T00:00:00Z`)
    const fim = Date.parse(`${periodo.fim}T00:00:00Z`)
    const dias = Math.floor((fim - inicio) / 86400000)
    if (!Number.isFinite(inicio) || !Number.isFinite(fim) || dias < 0) contexto.addIssue({ code: z.ZodIssueCode.custom, message: 'O período informado é inválido.' })
    if (dias > 366) contexto.addIssue({ code: z.ZodIssueCode.custom, message: 'O período máximo é de 366 dias.' })
  }
})

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

roteador.post('/auth/solicitar-reset', limitadorAutenticacao, validarRequisicao(z.object({ username: esquemaUsername })), asyncHandler(async (requisicao, resposta) => {
  await solicitarResetSenha(requisicao.body.username)
  return resposta.json({ mensagem: 'Se o usuário existir, a solicitação será encaminhada para aprovação.' })
}))

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

roteador.get('/auth/solicitacoes-reset', exigirAutenticacao, exigirAcessoDashboard, asyncHandler(async (requisicao, resposta) => {
  return resposta.json({ solicitacoes: await listarSolicitacoesReset(requisicao.usuario) })
}))

roteador.post('/auth/solicitacoes-reset/:id/aprovar', exigirAutenticacao, exigirAcessoDashboard, validarRequisicao(esquemaIdReset.extend({}), 'params'), asyncHandler(async (requisicao, resposta) => {
  try {
    return resposta.json({ sucesso: true, reset: await aprovarSolicitacaoReset(requisicao.params.id, requisicao.usuario) })
  } catch (erro) {
    if (erro.message === 'ACESSO_NEGADO') return resposta.status(403).json({ erro: 'Você não pode aprovar este reset.' })
    if (erro.message === 'SOLICITACAO_NAO_PENDENTE') return resposta.status(409).json({ erro: 'Esta solicitação já foi resolvida.' })
    throw erro
  }
}))

roteador.post('/auth/solicitacoes-reset/:id/rejeitar', exigirAutenticacao, exigirAcessoDashboard, validarRequisicao(esquemaIdReset, 'params'), asyncHandler(async (requisicao, resposta) => {
  try {
    await rejeitarSolicitacaoReset(requisicao.params.id, requisicao.usuario)
    return resposta.json({ sucesso: true })
  } catch (erro) {
    if (erro.message === 'ACESSO_NEGADO') return resposta.status(403).json({ erro: 'Você não pode rejeitar este reset.' })
    if (erro.message === 'SOLICITACAO_NAO_PENDENTE') return resposta.status(409).json({ erro: 'Esta solicitação já foi resolvida.' })
    throw erro
  }
}))

roteador.get('/dashboard', exigirAutenticacao, exigirAcessoDashboard, validarRequisicao(esquemaPeriodoDashboard, 'query'), asyncHandler(dashboardSarah))
roteador.get('/dashboard/analistas/:username', exigirAutenticacao, exigirAcessoDashboard, asyncHandler(detalhesAnalista))

roteador.use(exigirAutenticacao)
roteador.post('/operacional/previsualizar', exigirAcessoOperacional, limitadorAnalise, validarRequisicao(esquemaTextoEntrada), preVisualizarOperacional)
roteador.post('/operacional/gravar', exigirAcessoOperacional, limitadorGravacao, validarRequisicao(z.object({ dados: esquemaDadosOperacionais })), gravarOperacional)
roteador.get('/abas', asyncHandler(listarAbas))
roteador.post('/previsualizar', limitadorAnalise, validarRequisicao(esquemaTextoEntrada.extend({ username: esquemaUsername.optional() })), preVisualizarChamado)
roteador.post('/gravar', limitadorGravacao, validarRequisicao(esquemaGravacaoFinal), gravarChamado)
roteador.post('/desfazer', validarRequisicao(esquemaDesfazer), desfazerGravacao)
roteador.get('/sincronizar', validarRequisicao(esquemaSincronizar, 'query'), asyncHandler(sincronizarPlanilha))

export default roteador
