import { extrairDadosChamado } from '../services/aiService.js'
import { esquemaChamadoEstruturado } from '../schemas/chamadoSchema.js'
import { obterAnalista, ANALISTAS } from '../config/analistas.js'
import { obterStatusAnalistas } from '../services/authService.js'
import { contarChamadosHoje, contarPorData, existeProtocolo, listarChamados, salvarChamado, apagarChamado, todosChamados } from '../services/siteStore.js'

function dataAtualSaoPaulo() {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const valores = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]))
  return `${valores.year}-${valores.month}-${valores.day}`
}

function dataSaoPauloComDeslocamento(deslocamento) {
  const agora = new Date()
  agora.setUTCDate(agora.getUTCDate() - deslocamento)
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(agora)
  const valores = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]))
  return `${valores.year}-${valores.month}-${valores.day}`
}

function usernameAlvo(requisicao, solicitado) {
  if (!requisicao.usuario.acessoGlobal) return requisicao.usuario.sub
  return solicitado || requisicao.usuario.sub
}

export const preVisualizarChamado = async (requisicao, resposta) => {
  try {
    const username = usernameAlvo(requisicao, requisicao.body.username)
    const analista = obterAnalista(username)
    if (!analista) return resposta.status(400).json({ sucesso: false, erro: 'Selecione um analista válido.' })
    const dados = esquemaChamadoEstruturado.parse(await extrairDadosChamado(requisicao.body.textoManual))
    const existente = existeProtocolo(username, dados.protocolo)
    return resposta.json({ sucesso: true, dados, duplicado: Boolean(existente), chamadoDuplicado: existente?.id || null, username })
  } catch (erro) { return resposta.status(500).json({ sucesso: false, erro: erro.message || 'Falha ao analisar chamado.' }) }
}

export const gravarChamado = async (requisicao, resposta) => {
  try {
    const username = usernameAlvo(requisicao, requisicao.body.username)
    const analista = obterAnalista(username)
    if (!analista) return resposta.status(400).json({ sucesso: false, erro: 'Selecione um analista válido.' })
    const dados = esquemaChamadoEstruturado.parse(requisicao.body.dados)
    const chamado = salvarChamado(username, analista.nome, dados, dataAtualSaoPaulo())
    return resposta.json({ sucesso: true, mensagem: 'Chamado salvo no sistema.', dados: chamado, id: chamado.id, dataAtendimento: chamado.dataAtendimento })
  } catch (erro) { return resposta.status(500).json({ sucesso: false, erro: erro.message || 'Falha ao salvar o chamado.' }) }
}

export const desfazerGravacao = async (requisicao, resposta) => {
  try {
    const username = usernameAlvo(requisicao, requisicao.body.username)
    if (!apagarChamado(username, requisicao.body.id)) return resposta.status(404).json({ sucesso: false, erro: 'Chamado não encontrado.' })
    return resposta.json({ sucesso: true, mensagem: 'Chamado removido do sistema.' })
  } catch (erro) { return resposta.status(500).json({ sucesso: false, erro: erro.message || 'Falha ao desfazer.' }) }
}

export const sincronizarPlanilha = async (requisicao, resposta) => {
  const username = usernameAlvo(requisicao, requisicao.query.username)
  return resposta.json({ sucesso: true, protocolosAtivos: listarChamados(username).map((chamado) => chamado.protocolo), totalNaPlanilha: listarChamados(username).length })
}

export const listarAbas = async (requisicao, resposta) => {
  const visiveis = requisicao.usuario.acessoGlobal ? ANALISTAS : ANALISTAS.filter((analista) => analista.username === requisicao.usuario.sub)
  return resposta.json({ abas: visiveis.map((analista) => ({ nome: analista.nome, id: analista.username })) })
}

export const dashboardSarah = async (requisicao, resposta) => {
  try {
    const data = dataAtualSaoPaulo()
    const status = obterStatusAnalistas().filter((analista) => analista.username !== 'sarah.silva')
    const analistas = status.map((analista) => ({ ...analista, totalChamados: listarChamados(analista.username).length, atendimentosHoje: contarChamadosHoje(analista.username, data) }))
    const ultimosSeteDias = Array.from({ length: 7 }, (_, indice) => { const dia = dataSaoPauloComDeslocamento(6 - indice); return { data: dia, total: contarPorData(dia) } })
    const totalHoje = analistas.reduce((total, analista) => total + analista.atendimentosHoje, 0)
    return resposta.json({ data, totalHoje, totalGeral: todosChamados().length, analistasAtivos: analistas.filter((analista) => analista.status.startsWith('Ativo')).length, mediaPorAnalista: analistas.length ? (totalHoje / analistas.length).toFixed(1) : '0.0', ultimosSeteDias, analistas })
  } catch (erro) { return resposta.status(500).json({ erro: 'Falha ao carregar o dashboard.' }) }
}

export const detalhesAnalista = async (requisicao, resposta) => {
  const analista = obterAnalista(requisicao.params.username)
  if (!analista || analista.username === 'sarah.silva') return resposta.status(404).json({ erro: 'Analista não encontrado.' })
  const chamados = listarChamados(analista.username)
  return resposta.json({ analista, chamados, total: chamados.length, atendimentosHoje: contarChamadosHoje(analista.username, dataAtualSaoPaulo()) })
}
