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

// Funções utilitárias de higienização de dados
function limparEspacos(texto = '') {
  return String(texto).trim().replace(/\s+/g, ' ')
}

function padronizarProtocolo(protocolo = '') {
  return String(protocolo).trim().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ')
}

function padronizarTextoGeral(texto = '') {
  return limparEspacos(texto).toUpperCase()
}

export class Chamado {
  constructor(dados = {}) {
    this.protocolo = padronizarProtocolo(dados.protocolo || 'Nao informado')
    this.seguradora = padronizarTextoGeral(dados.seguradora || 'Nao informado')
    this.servico = padronizarTextoGeral(dados.servico || 'Nao informado')
    this.previaServico = padronizarTextoGeral(dados.previaServico || dados.previa_servico || dados.previa || 'Nao informado')
    this.localidade = padronizarTextoGeral(dados.localidade || 'Nao informado')
    this.baseAcionada = padronizarTextoGeral(dados.baseAcionada || dados.base_acionada || dados.base || 'Nao acionada')
    this.dataMarcada = limparEspacos(dados.dataMarcada || dados.data_marcada || dados.data || 'Nao informado')
    this.horarioMarcado = padronizarTextoGeral(dados.horarioMarcado || dados.horario_marcado || dados.horario || 'Nao informado')
    this.retratacaoInicial = limparEspacos(dados.retratacaoInicial || dados.retratacao_inicial || 'AGENDAMENTO')
    this.retratacaoFinal = limparEspacos(dados.retratacaoFinal || dados.retratacao_final || 'AGENDAMENTO')
    this.resumoTentativas = String(dados.resumoTentativas || dados.resumo_tentativas || 'Nao informado').trim()
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

  static async verificarDuplicado(protocolo) {
    if (!protocolo || protocolo === 'Nao informado') return null

    const protocoloNormalizado = padronizarProtocolo(protocolo)
    const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
    const resposta = await servicoPlanilhas.spreadsheets.values.get({
      spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
      range: 'A:A'
    })

    const linhas = resposta.data.values || []
    const indice = linhas.findIndex((linha) => {
      if (!linha[0]) return false
      return padronizarProtocolo(linha[0]) === protocoloNormalizado
    })

    if (indice !== -1) {
      return indice + 1
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
