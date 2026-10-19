import { google } from 'googleapis'
import { configuracaoAmbiente } from '../config/env.js'

// Cria a autenticação lendo do arquivo local ou da variável de ambiente da nuvem
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
    localidade,
    dataHoraEnvioRede = 'Nao informado',
    dataHoraRetorno = 'Nao informado',
    baseIndicada = 'Nao informado',
    acionadaComIndicacao = 'Nao',
    resumoTentativas = 'Nao informado'
  }) {
    this.protocolo = protocolo
    this.seguradora = seguradora
    this.servico = servico
    this.localidade = localidade
    this.dataHoraEnvioRede = dataHoraEnvioRede
    this.dataHoraRetorno = dataHoraRetorno
    this.baseIndicada = baseIndicada
    this.acionadaComIndicacao = acionadaComIndicacao
    this.resumoTentativas = resumoTentativas
  }

  converterParaLinhaPlanilha() {
    return [
      this.protocolo,
      this.seguradora,
      this.servico,
      this.localidade,
      this.dataHoraEnvioRede,
      this.dataHoraRetorno,
      this.baseIndicada,
      this.acionadaComIndicacao,
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