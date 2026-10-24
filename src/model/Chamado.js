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
    this.baseAcionada = padronizarTextoGeral(dados.baseAcionada || dados.base_acionada || dados.base || 'NAO ACIONADA')
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

  // 1. Salvar na planilha e formatar automaticamente a linha recém-criada
  async salvarNaPlanilha() {
    const servicoPlanilhas = google.sheets({ 
      version: 'v4', 
      auth: autenticacaoGoogle 
    })

    const respostaAppend = await servicoPlanilhas.spreadsheets.values.append({
      spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [this.converterParaLinhaPlanilha()]
      }
    })

    // Extrai o índice numérico da linha criada (ex: "Página1!A10:K10" -> 10)
    let numeroLinha = null
    const faixaAtualizada = respostaAppend.data.updates?.updatedRange
    if (faixaAtualizada) {
      const match = faixaAtualizada.match(/A(\d+):/)
      if (match) numeroLinha = parseInt(match[1], 10)
    }

    if (numeroLinha) {
      await this.formatarLinhaPlanilha(servicoPlanilhas, numeroLinha)
    }

    return { chamado: this, linhaCriada: numeroLinha }
  }

  // 2. Aplica formatação via batchUpdate (Bordas, Wrap Text, Alinhamento Topo e Alerta de Base Não Acionada)
  async formatarLinhaPlanilha(servicoPlanilhas, numeroLinha) {
    try {
      const indiceLinha = numeroLinha - 1 // Índice base zero da API
      const ehLinhaPar = numeroLinha % 2 === 0
      const baseNaoAcionada = this.baseAcionada.includes('NAO ACIONADA')

      // Cor de fundo: Avermelhado suave se não acionada, senão efeito zebra (branco / cinza claríssimo)
      let corFundo = ehLinhaPar 
        ? { red: 0.97, green: 0.98, blue: 0.99 } 
        : { red: 1.0, green: 1.0, blue: 1.0 }

      if (baseNaoAcionada) {
        corFundo = { red: 0.99, green: 0.92, blue: 0.92 } // Tom suave de erro/alerta
      }

      await servicoPlanilhas.spreadsheets.batchUpdate({
        spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  startRowIndex: indiceLinha,
                  endRowIndex: indiceLinha + 1,
                  startColumnIndex: 0,
                  endColumnIndex: 11
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: corFundo,
                    verticalAlignment: 'TOP',
                    wrapStrategy: 'WRAP',
                    textFormat: {
                      fontFamily: 'Arial',
                      fontSize: 10
                    }
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,verticalAlignment,wrapStrategy,textFormat)'
              }
            },
            {
              updateBorders: {
                range: {
                  startRowIndex: indiceLinha,
                  endRowIndex: indiceLinha + 1,
                  startColumnIndex: 0,
                  endColumnIndex: 11
                },
                top: { style: 'SOLID', color: { red: 0.85, green: 0.88, blue: 0.92 } },
                bottom: { style: 'SOLID', color: { red: 0.85, green: 0.88, blue: 0.92 } },
                left: { style: 'SOLID', color: { red: 0.85, green: 0.88, blue: 0.92 } },
                right: { style: 'SOLID', color: { red: 0.85, green: 0.88, blue: 0.92 } },
                innerHorizontal: { style: 'SOLID', color: { red: 0.85, green: 0.88, blue: 0.92 } },
                innerVertical: { style: 'SOLID', color: { red: 0.85, green: 0.88, blue: 0.92 } }
              }
            }
          ]
        }
      })
    } catch (erroFormatar) {
      console.warn('Formatação da linha ignorada (não crítica):', erroFormatar.message)
    }
  }

  // 3. Exclui linha na planilha para a função Desfazer (Undo)
  static async apagarLinhaPlanilha(numeroLinha) {
    if (!numeroLinha || numeroLinha <= 1) {
      throw new Error('Número de linha inválido para exclusão.')
    }

    const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
    const indiceLinha = numeroLinha - 1

    await servicoPlanilhas.spreadsheets.batchUpdate({
      spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                dimension: 'ROWS',
                startIndex: indiceLinha,
                endIndex: indiceLinha + 1
              }
            }
          }
        ]
      }
    })

    return true
  }
}
