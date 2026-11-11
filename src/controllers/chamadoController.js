import { extrairDadosChamado } from '../services/aiService.js'
import { esquemaChamadoEstruturado } from '../schemas/chamadoSchema.js'
import { obterAnalista, ANALISTAS, obterAnalistasVisiveis } from '../config/analistas.js'
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
  const visiveis = obterAnalistasVisiveis(requisicao.usuario)
  if (!requisicao.usuario.acessoDashboard) return requisicao.usuario.sub
  return visiveis.some((analista) => analista.username === solicitado) ? solicitado : visiveis[0]?.username
}

export const preVisualizarChamado = async (requisicao, resposta) => {
  try {
    const username = usernameAlvo(requisicao, requisicao.body.username)
    const analista = obterAnalista(username)
    if (!analista) return resposta.status(400).json({ sucesso: false, erro: 'Selecione um analista vÃ¡lido.' })
    const dados = esquemaChamadoEstruturado.parse(await extrairDadosChamado(requisicao.body.textoManual))
    const existente = await existeProtocolo(username, dados.protocolo)
    return resposta.json({ sucesso: true, dados, duplicado: Boolean(existente), chamadoDuplicado: existente?.id || null, username })
  } catch (erro) { return resposta.status(500).json({ sucesso: false, erro: erro.message || 'Falha ao analisar chamado.' }) }
}

export const gravarChamado = async (requisicao, resposta) => {
  try {
    const username = usernameAlvo(requisicao, requisicao.body.username)
    const analista = obterAnalista(username)
    if (!analista) return resposta.status(400).json({ sucesso: false, erro: 'Selecione um analista vÃ¡lido.' })
    const dados = esquemaChamadoEstruturado.parse(requisicao.body.dados)
    const chamado = await salvarChamado(username, analista.nome, dados, dataAtualSaoPaulo())
    return resposta.json({ sucesso: true, mensagem: 'Chamado salvo no sistema.', dados: chamado, id: chamado.id, dataAtendimento: chamado.dataAtendimento })
  } catch (erro) { return resposta.status(500).json({ sucesso: false, erro: erro.message || 'Falha ao salvar o chamado.' }) }
}

export const desfazerGravacao = async (requisicao, resposta) => {
  try {
    const username = usernameAlvo(requisicao, requisicao.body.username)
    if (!await apagarChamado(username, requisicao.body.id)) return resposta.status(404).json({ sucesso: false, erro: 'Chamado nÃ£o encontrado.' })
    return resposta.json({ sucesso: true, mensagem: 'Chamado removido do sistema.' })
  } catch (erro) { return resposta.status(500).json({ sucesso: false, erro: erro.message || 'Falha ao desfazer.' }) }
}

export const sincronizarPlanilha = async (requisicao, resposta) => {
  const username = usernameAlvo(requisicao, requisicao.query.username)
  const chamados = await listarChamados(username)
  return resposta.json({ sucesso: true, protocolosAtivos: chamados.map((chamado) => chamado.protocolo), totalNaPlanilha: chamados.length })
}

export const listarAbas = async (requisicao, resposta) => {
  const visiveis = obterAnalistasVisiveis(requisicao.usuario)
  return resposta.json({ abas: visiveis.map((analista) => ({ nome: analista.nome, id: analista.username })) })
}

export const dashboardSarah = async (requisicao, resposta) => {
  try {
    const data = dataAtualSaoPaulo()
    const usernamesVisiveis = obterAnalistasVisiveis(requisicao.usuario).map((analista) => analista.username)
    const status = obterStatusAnalistas()
      .filter((analista) => obterAnalistasVisiveis(requisicao.usuario).some((visivel) => visivel.username === analista.username))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
    const analistas = await Promise.all(status.map(async (analista) => ({
      ...analista,
      totalChamados: (await listarChamados(analista.username)).length,
      atendimentosHoje: await contarChamadosHoje(analista.username, data)
    })))
    const ultimosSeteDias = await Promise.all(Array.from({ length: 7 }, async (_, indice) => {
      const dia = dataSaoPauloComDeslocamento(6 - indice)
      return { data: dia, total: await contarPorData(dia, usernamesVisiveis) }
    }))
    const totalHoje = analistas.reduce((total, analista) => total + analista.atendimentosHoje, 0)
    const usernames = new Set(analistas.map((analista) => analista.username))
    const totalGeral = (await todosChamados()).filter((chamado) => usernames.has(chamado.username)).length
    return resposta.json({ data, totalHoje, totalGeral, analistasAtivos: analistas.filter((analista) => analista.status.startsWith('Ativo')).length, mediaPorAnalista: analistas.length ? (totalHoje / analistas.length).toFixed(1) : '0.0', ultimosSeteDias, analistas })
  } catch (erro) { return resposta.status(500).json({ erro: 'Falha ao carregar o dashboard.' }) }
}

export const detalhesAnalista = async (requisicao, resposta) => {
  const analista = obterAnalista(requisicao.params.username)
  if (analista && !obterAnalistasVisiveis(requisicao.usuario).some((visivel) => visivel.username === analista.username)) return resposta.status(404).json({ erro: 'Analista não encontrado.' })
  if (!analista || !obterAnalistasVisiveis(requisicao.usuario).some((visivel) => visivel.username === analista.username)) return resposta.status(404).json({ erro: 'Analista não encontrado.' })
  const chamados = await listarChamados(analista.username)
  return resposta.json({ analista, chamados, total: chamados.length, atendimentosHoje: await contarChamadosHoje(analista.username, dataAtualSaoPaulo()) })
}
