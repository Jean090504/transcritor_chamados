import { google } from 'googleapis'
import { configuracaoAmbiente } from '../config/env.js'

const credenciaisObjeto = process.env.GOOGLE_CREDENTIALS_JSON
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
  : undefined

const autenticacaoGoogle = new google.auth.GoogleAuth({
  ...(credenciaisObjeto 
    ? { credentials: credenciaisObjeto } 
    : { keyFile: 'credentials.json' }
  ),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
})

export class Chamado {
  constructor(dados = {}) {
    this.protocolo = dados.protocolo || 'Nao informado'
    this.seguradora = dados.seguradora || 'Nao informado'
    this.servico = dados.servico || 'Nao informado'
    this.previaServico = dados.previaServico || dados.previa_servico || dados.previa || 'Nao informado'
    this.localidade = dados.localidade || 'Nao informado'
    this.baseAcionada = dados.baseAcionada || dados.base_acionada || dados.base || 'Nao acionada'
    this.dataMarcada = dados.dataMarcada || dados.data_marcada || dados.data || 'Nao informado'
    this.horarioMarcado = dados.horarioMarcado || dados.horario_marcado || dados.horario || 'Nao informado'
    this.retratacaoInicial = dados.retratacaoInicial || dados.retratacao_inicial || 'AGENDAMENTO'
    this.retratacaoFinal = dados.retratacaoFinal || dados.retratacao_final || 'AGENDAMENTO'
    this.resumoTentativas = dados.resumoTentativas || dados.resumo_tentativas || 'Nao informado'
  }

  converterParaLinhaPlanilha() {
    return [
      this.protocolo,
      this.seguradora,
      this.servico,
      this.previaServico,
      this.localidade,
      this.baseAcionada,
      this.dataMarcada,
      this.horarioMarcado,
      this.retratacaoInicial,
      this.retratacaoFinal,
      this.resumoTentativas
    ]
  }

  // Verifica se o protocolo já existe na coluna A
  static async verificarDuplicado(protocolo) {
    if (!protocolo || protocolo === 'Nao informado') return null

    const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
    const resposta = await servicoPlanilhas.spreadsheets.values.get({
      spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
      range: 'A:A'
    })

    const linhas = resposta.data.values || []
    const indice = linhas.findIndex((linha) => linha[0] && linha[0].toString().trim() === protocolo.trim())

    if (indice !== -1) {
      return indice + 1 // Retorna o número da linha na folha
    }
    return null
  }

  async salvarNaPlanilha() {
    const servicoPlanilhasGoogle = google.sheets({ 
      version: 'v4', 
      auth: autenticacaoGoogle 
    })

    await servicoPlanilhasGoogle.spreadsheets.values.append({
      spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [this.converterParaLinhaPlanilha()]
      }
    })

    return this
  }
}
