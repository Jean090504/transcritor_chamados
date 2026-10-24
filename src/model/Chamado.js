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
  constructor({
    protocolo,
    seguradora,
    servico,
    previaServico = 'Nao informado',
    localidade,
    baseAcionada = 'Nao acionada',
    dataMarcada = 'Nao informado',
    horarioMarcado = 'Nao informado',
    retratacaoInicial = 'AGENDAMENTO',
    resumoTentativas = 'Nao informado'
  }) {
    this.protocolo = protocolo
    this.seguradora = seguradora
    this.servico = servico
    this.previaServico = previaServico
    this.localidade = localidade
    this.baseAcionada = baseAcionada
    this.dataMarcada = dataMarcada
    this.horarioMarcado = horarioMarcado
    this.retratacaoInicial = retratacaoInicial
    this.resumoTentativas = resumoTentativas
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
      this.resumoTentativas
    ]
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
