import { google } from 'googleapis'
import { configuracaoAmbiente } from '../config/env.js'

const credenciaisObjeto = process.env.GOOGLE_CREDENTIALS_JSON
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
  : undefined

export const autenticacaoGoogle = new google.auth.GoogleAuth({
  ...(credenciaisObjeto ? { credentials: credenciaisObjeto } : { keyFile: 'credentials.json' }),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
})

function nomeAbaSeguro(nomeAba = 'Sheet1') { return String(nomeAba).replace(/'/g, "''") }
function limparEspacos(texto = '') { return String(texto).trim().replace(/\s+/g, ' ') }
function padronizarProtocolo(protocolo = '') { return String(protocolo).trim().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ') }
function padronizarTextoGeral(texto = '') { return limparEspacos(texto).toUpperCase() }

function dataAtualSaoPaulo() {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const valores = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]))
  return `${valores.year}-${valores.month}-${valores.day}`
}

export async function obterAbasPlanilha() {
  const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
  const resposta = await servicoPlanilhas.spreadsheets.get({
    spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
    fields: 'sheets(properties(sheetId,title,index))'
  })
  return (resposta.data.sheets || []).map((aba) => aba.properties)
}

export async function garantirAbasPlanilha(nomesAbas, cabecalho) {
  const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
  const atuais = await obterAbasPlanilha()
  const faltantes = nomesAbas.filter((nome) => !atuais.some((aba) => aba.title === nome))
  if (faltantes.length) {
    await servicoPlanilhas.spreadsheets.batchUpdate({
      spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
      requestBody: { requests: faltantes.map((title) => ({ addSheet: { properties: { title } } })) }
    })
  }
  const abas = await obterAbasPlanilha()
  if (cabecalho) {
    await Promise.all(nomesAbas.map(async (nome) => {
      if (!abas.some((aba) => aba.title === nome)) return
      await servicoPlanilhas.spreadsheets.values.update({
        spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
        range: `'${nomeAbaSeguro(nome)}'!A1:L1`, valueInputOption: 'USER_ENTERED', requestBody: { values: [cabecalho] }
      })
    }))
  }
  return abas
}

export async function contarAtendimentosPorData(nomeAba, data) {
  // TODO(manutenção): este módulo ainda contém o fluxo antigo direto na planilha.
  // O fluxo atual grava no PostgreSQL; remover ou migrar estes métodos quando não
  // houver mais consumidores para evitar duas fontes de verdade.
  const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
  const resposta = await servicoPlanilhas.spreadsheets.values.get({
    spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
    range: `'${nomeAbaSeguro(nomeAba)}'!L2:L`
  })
  return (resposta.data.values || []).filter((linha) => linha[0] === data).length
}

async function obterAba(nomeAba) {
  const aba = (await obterAbasPlanilha()).find((item) => item.title === nomeAba)
  if (!aba) throw new Error(`Aba "${nomeAba}" não encontrada.`)
  return aba
}

export class Chamado {
  constructor(dados = {}) {
    this.protocolo = padronizarProtocolo(dados.protocolo || 'Nao informado')
    this.seguradora = padronizarTextoGeral(dados.seguradora || 'Nao informado')
    this.servico = padronizarTextoGeral(dados.servico || 'Nao informado')
    this.previaServico = padronizarTextoGeral(dados.previaServico || dados.previa_servico || dados.previa || 'Nao informado')
    this.localidade = padronizarTextoGeral(dados.localidade || 'Nao informado')
    this.baseAcionada = padronizarTextoGeral(dados.baseAcionada || dados.base_acionada || dados.base || 'NAO ACIONADA')
    this.dataMarcada = limparEspacos(dados.dataMarcada || dados.data_marcada || dados.data || 'Nao informado')
    this.horarioMarcado = padronizarTextoGeral(dados.horarioMarcado || dados.horario_marcado || dados.horario || 'Nao informado')
    this.retratacaoInicial = limparEspacos(dados.retratacaoInicial || dados.retratacao_inicial || 'AGENDAMENTO')
    this.retratacaoFinal = limparEspacos(dados.retratacaoFinal || dados.retratacao_final || 'AGENDAMENTO')
    this.resumoTentativas = String(dados.resumoTentativas || dados.resumo_tentativas || 'Nao informado').trim()
  }

  converterParaLinhaPlanilha() {
    return [this.protocolo, this.seguradora, this.servico, this.previaServico, this.localidade, this.baseAcionada,
      this.dataMarcada, this.horarioMarcado, this.retratacaoInicial, this.retratacaoFinal, this.resumoTentativas, this.dataAtendimento]
  }

  static async verificarDuplicado(protocolo, nomeAba) {
    if (!protocolo || protocolo === 'Nao informado') return null
    const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
    const resposta = await servicoPlanilhas.spreadsheets.values.get({ spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA, range: `'${nomeAbaSeguro(nomeAba)}'!A:A` })
    const normalizado = padronizarProtocolo(protocolo)
    const indice = (resposta.data.values || []).findIndex((linha) => linha[0] && padronizarProtocolo(linha[0]) === normalizado)
    return indice === -1 ? null : indice + 1
  }

  async salvarNaPlanilha(nomeAba) {
    this.dataAtendimento = dataAtualSaoPaulo()
    const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
    const resposta = await servicoPlanilhas.spreadsheets.values.append({
      spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA, range: `'${nomeAbaSeguro(nomeAba)}'!A1`, valueInputOption: 'USER_ENTERED', requestBody: { values: [this.converterParaLinhaPlanilha()] }
    })
    const match = resposta.data.updates?.updatedRange?.match(/!A(\d+):/)
    const numeroLinha = match ? parseInt(match[1], 10) : null
    if (numeroLinha) await this.formatarLinhaPlanilha(servicoPlanilhas, numeroLinha, nomeAba)
    return { chamado: this, linhaCriada: numeroLinha }
  }

  async formatarLinhaPlanilha(servicoPlanilhas, numeroLinha, nomeAba) {
    try {
      const aba = await obterAba(nomeAba)
      const indice = numeroLinha - 1
      const cor = this.baseAcionada.includes('NAO ACIONADA') ? { red: 0.99, green: 0.92, blue: 0.92 } : (numeroLinha % 2 === 0 ? { red: 0.97, green: 0.98, blue: 0.99 } : { red: 1, green: 1, blue: 1 })
      await servicoPlanilhas.spreadsheets.batchUpdate({
        spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
        requestBody: { requests: [{ repeatCell: {
          range: { sheetId: aba.sheetId, startRowIndex: indice, endRowIndex: indice + 1, startColumnIndex: 0, endColumnIndex: 12 },
          cell: { userEnteredFormat: { backgroundColor: cor, verticalAlignment: 'TOP', wrapStrategy: 'WRAP', textFormat: { fontFamily: 'Arial', fontSize: 10 } } }, fields: 'userEnteredFormat(backgroundColor,verticalAlignment,wrapStrategy,textFormat)'
        }, updateBorders: {
          range: { sheetId: aba.sheetId, startRowIndex: indice, endRowIndex: indice + 1, startColumnIndex: 0, endColumnIndex: 12 }, top: { style: 'SOLID' }, bottom: { style: 'SOLID' }, left: { style: 'SOLID' }, right: { style: 'SOLID' }
        }}] }
      })
    } catch (erro) { console.warn('Formatação ignorada:', erro.message) }
  }

  static async apagarLinhaPlanilha(numeroLinha, nomeAba) {
    if (!numeroLinha || numeroLinha <= 1) throw new Error('Número de linha inválido para exclusão.')
    const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
    const aba = await obterAba(nomeAba)
    await servicoPlanilhas.spreadsheets.batchUpdate({ spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA, requestBody: { requests: [{ deleteDimension: { range: { sheetId: aba.sheetId, dimension: 'ROWS', startIndex: numeroLinha - 1, endIndex: numeroLinha } } }] } })
  }
}
