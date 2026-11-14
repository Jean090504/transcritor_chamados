import { extrairDadosChamado, extrairDadosOperacionais } from '../services/aiService.js'
import { esquemaChamadoEstruturado, esquemaDadosOperacionais } from '../schemas/chamadoSchema.js'
import { obterAnalista, ANALISTAS, obterAnalistasVisiveis } from '../config/analistas.js'
import { obterStatusAnalistas } from '../services/authService.js'
import { contarChamadosHoje, contarStatusAtendimentosHoje, obterResumoPeriodo, contarPorData, existeProtocolo, listarChamados, salvarChamado, apagarChamado, atualizarChamado, todosChamados } from '../services/siteStore.js'
import { prepararRegistroOperacional } from '../services/operacionalService.js'
import { listarHistoricoOperacional, salvarRegistroOperacionalSeguro } from '../services/operacionalRegistroService.js'

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
  return visiveis.some((analista) => analista.username === solicitado) ? solicitado : null
}

export const preVisualizarChamado = async (requisicao, resposta) => {
  try {
    const username = usernameAlvo(requisicao, requisicao.body.username)
    const analista = obterAnalista(username)
    if (!analista) return resposta.status(400).json({ sucesso: false, erro: 'Selecione um analista vÃ¡lido.' })
    const dados = esquemaChamadoEstruturado.parse(await extrairDadosChamado(requisicao.body.textoManual))
    const existente = await existeProtocolo(username, dados.protocolo)
    return resposta.json({ sucesso: true, dados, duplicado: Boolean(existente), chamadoDuplicado: existente?.id || null, username })
  } catch (erro) { console.error('Falha ao analisar chamado:', erro); return resposta.status(500).json({ sucesso: false, erro: 'Falha ao analisar chamado.' }) }
}

export const preVisualizarOperacional = async (requisicao, resposta) => {
  try {
    const dados = esquemaDadosOperacionais.parse(await extrairDadosOperacionais(requisicao.body.textoManual))
    return resposta.json({ sucesso: true, dados: prepararRegistroOperacional(dados, requisicao.usuario) })
  } catch (erro) {
    console.error('Falha ao analisar registro operacional:', erro?.stack || erro)
    if (erro.codigo === 'IA_INDISPONIVEL') return resposta.status(erro.status || 503).json({ sucesso: false, erro: erro.mensagemPublica || erro.message })
    const detalhe = String(erro?.message || '').replace(/AIza[\w-]{20,}/g, '[chave ocultada]').slice(0, 240)
    return resposta.status(502).json({ sucesso: false, erro: detalhe ? `Falha na IA: ${detalhe}` : 'Falha na IA ao analisar o chamado operacional.' })
  }
}

export const gravarOperacional = async (requisicao, resposta) => {
  try {
    const dados = esquemaDadosOperacionais.parse(requisicao.body.dados)
    const resultado = await salvarRegistroOperacionalSeguro(dados, requisicao.usuario, requisicao.body.idempotencia)
    return resposta.json({ sucesso: true, mensagem: 'Registro enviado para a planilha operacional.', ...resultado })
  } catch (erro) {
    if (erro.codigo === 'ENVIO_EM_PROCESSAMENTO') return resposta.status(409).json({ sucesso: false, erro: 'Este envio já está sendo processado. Aguarde alguns segundos e atualize o histórico.' })
    console.error('Falha ao enviar registro operacional:', erro)
    return resposta.status(500).json({ sucesso: false, erro: 'Falha ao enviar o registro para a planilha.' })
  }
}

export const historicoOperacional = async (requisicao, resposta) => {
  const historico = await listarHistoricoOperacional(requisicao.usuario.sub, requisicao.query.limite)
  return resposta.json({ sucesso: true, historico })
}

export const gravarChamado = async (requisicao, resposta) => {
  try {
    const username = usernameAlvo(requisicao, requisicao.body.username)
    const analista = obterAnalista(username)
    if (!analista) return resposta.status(400).json({ sucesso: false, erro: 'Selecione um analista vÃ¡lido.' })
    const dados = esquemaChamadoEstruturado.parse(requisicao.body.dados)
    const chamado = await salvarChamado(username, analista.nome, dados, dataAtualSaoPaulo())
    return resposta.json({ sucesso: true, mensagem: 'Chamado salvo no sistema.', dados: chamado, id: chamado.id, dataAtendimento: chamado.dataAtendimento })
  } catch (erro) { console.error('Falha ao salvar chamado:', erro); return resposta.status(500).json({ sucesso: false, erro: 'Falha ao salvar o chamado.' }) }
}

export const desfazerGravacao = async (requisicao, resposta) => {
  try {
    const username = usernameAlvo(requisicao, requisicao.body.username)
    if (!await apagarChamado(username, requisicao.body.id)) return resposta.status(404).json({ sucesso: false, erro: 'Chamado nÃ£o encontrado.' })
    return resposta.json({ sucesso: true, mensagem: 'Chamado removido do sistema.' })
  } catch (erro) { console.error('Falha ao desfazer chamado:', erro); return resposta.status(500).json({ sucesso: false, erro: 'Falha ao desfazer.' }) }
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
    const inicio = requisicao.query.inicio || dataSaoPauloComDeslocamento(6)
    const fim = requisicao.query.fim || data
    const usernamesVisiveis = obterAnalistasVisiveis(requisicao.usuario).map((analista) => analista.username)
    const status = obterStatusAnalistas()
      .filter((analista) => obterAnalistasVisiveis(requisicao.usuario).some((visivel) => visivel.username === analista.username))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
    // TODO(performance): esta montagem faz 2 consultas por analista. Substituir por
    // agregações agrupadas por username/data para evitar N+1 quando a equipe crescer.
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
    const statusAtendimentosHoje = await contarStatusAtendimentosHoje(usernamesVisiveis, data)
    const resumoPeriodo = await obterResumoPeriodo(usernamesVisiveis, inicio, fim)
    const usernames = new Set(analistas.map((analista) => analista.username))
    // TODO(performance): não carregar todos os chamados e filtrá-los em memória.
    // Criar uma contagem agrupada no banco usando apenas os usernames visíveis.
    const totalGeral = (await todosChamados()).filter((chamado) => usernames.has(chamado.username)).length
    return resposta.json({ data, totalHoje, statusAtendimentosHoje, totalGeral, analistasAtivos: analistas.filter((analista) => analista.status.startsWith('Ativo')).length, periodo: { inicio, fim }, resumoPeriodo, ultimosSeteDias, analistas })
  } catch (erro) { return resposta.status(500).json({ erro: 'Falha ao carregar o dashboard.' }) }
}

export const detalhesAnalista = async (requisicao, resposta) => {
  // TODO(manutenção): as duas guardas abaixo verificam a mesma condição. Manter
  // uma única validação para reduzir duplicidade quando esta rota for alterada.
  const analista = obterAnalista(requisicao.params.username)
  if (analista && !obterAnalistasVisiveis(requisicao.usuario).some((visivel) => visivel.username === analista.username)) return resposta.status(404).json({ erro: 'Analista não encontrado.' })
  if (!analista || !obterAnalistasVisiveis(requisicao.usuario).some((visivel) => visivel.username === analista.username)) return resposta.status(404).json({ erro: 'Analista não encontrado.' })
  const chamados = await listarChamados(analista.username)
  return resposta.json({ analista, chamados, total: chamados.length, atendimentosHoje: await contarChamadosHoje(analista.username, dataAtualSaoPaulo()) })
}

export const editarChamado = async (requisicao, resposta) => {
  const username = usernameAlvo(requisicao, requisicao.params.username)
  if (!username || !obterAnalista(username)) return resposta.status(404).json({ erro: 'Analista não encontrado.' })
  try {
    const dados = esquemaChamadoEstruturado.parse(requisicao.body.dados)
    const chamado = await atualizarChamado(username, requisicao.params.id, dados)
    if (!chamado) return resposta.status(404).json({ erro: 'Chamado não encontrado.' })
    return resposta.json({ sucesso: true, dados: chamado })
  } catch (erro) {
    console.error('Falha ao editar chamado:', erro)
    return resposta.status(500).json({ erro: 'Falha ao atualizar o chamado.' })
  }
}

export const excluirChamado = async (requisicao, resposta) => {
  const username = usernameAlvo(requisicao, requisicao.params.username)
  if (!username || !obterAnalista(username)) return resposta.status(404).json({ erro: 'Analista não encontrado.' })
  const removido = await apagarChamado(username, requisicao.params.id)
  if (!removido) return resposta.status(404).json({ erro: 'Chamado não encontrado.' })
  return resposta.json({ sucesso: true })
}
