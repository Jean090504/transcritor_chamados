import { google } from 'googleapis'
import { configuracaoAmbiente } from '../config/env.js'
import { autenticacaoGoogle, obterAbasPlanilha } from '../model/Chamado.js'

export const CABECALHO_OPERACIONAL = [
  'Assistência', 'Barra', 'Outra assist', 'Serviço', 'Cidade', 'UF', 'Cliente',
  'Data e hora da solicitação', 'Data e hora do retorno', 'Tempo de Retorno',
  'Por que pedimos auxílio?', 'Faixa de retorno', 'Houve atuação da rede?',
  'Retorno do auxílio', 'Serviço acionado com a base indicada',
  'Resolução do acionamento', 'Base acionada', 'Acionado em qual barra?',
  'Respondido por', 'Adm - Elaine Marreiros'
]

function nomeAbaSeguro(nome) { return String(nome).replace(/'/g, "''") }

function extrairBarra(protocolo = '') {
  const correspondencia = String(protocolo).trim().match(/\/\s*(\d+)\s*$/)
  return correspondencia ? correspondencia[1] : ''
}

function separarDataHora(valor = '') {
  const texto = String(valor).trim()
  const local = texto.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
  if (local) return { ano: local[1], mes: local[2], dia: local[3], hora: local[4], minuto: local[5] }
  const brasileiro = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/)
  if (brasileiro) return { ano: brasileiro[3], mes: brasileiro[2], dia: brasileiro[1], hora: brasileiro[4], minuto: brasileiro[5] }
  return null
}

function formatarDataHora(valor) {
  const partes = separarDataHora(valor)
  return partes ? `${partes.dia}/${partes.mes}/${partes.ano} ${partes.hora}:${partes.minuto}` : String(valor || '').trim()
}

function minutosEntre(inicio, fim) {
  const a = separarDataHora(inicio)
  const b = separarDataHora(fim)
  if (!a || !b) return null
  const inicioMs = Date.UTC(Number(a.ano), Number(a.mes) - 1, Number(a.dia), Number(a.hora), Number(a.minuto))
  const fimMs = Date.UTC(Number(b.ano), Number(b.mes) - 1, Number(b.dia), Number(b.hora), Number(b.minuto))
  const minutos = Math.round((fimMs - inicioMs) / 60000)
  return minutos >= 0 ? minutos : null
}

function faixaRetorno(minutos) {
  if (minutos === null) return 'Não informado'
  if (minutos <= 15) return 'Até 15 min'
  if (minutos <= 30) return '16–30 min'
  if (minutos <= 60) return '31–60 min'
  return 'Acima de 60 min'
}

export function prepararRegistroOperacional(dados, usuario) {
  const protocolo = String(dados.protocolo || '').trim()
  const barra = extrairBarra(protocolo)
  const tempoMinutos = minutosEntre(dados.dataHoraSolicitacao, dados.dataHoraRetorno)
  const respondidoPor = usuario?.nome || dados.respondidoPor || ''
  return {
    ...dados,
    protocolo,
    assistencia: dados.assistencia || '',
    barra,
    tempoRetorno: tempoMinutos === null ? 'Não informado' : `${tempoMinutos} min`,
    faixaRetorno: faixaRetorno(tempoMinutos),
    dataHoraSolicitacao: formatarDataHora(dados.dataHoraSolicitacao),
    dataHoraRetorno: formatarDataHora(dados.dataHoraRetorno),
    respondidoPor,
    adm: usuario?.nome || dados.adm || respondidoPor
  }
}

export async function salvarRegistroOperacional(dados, usuario) {
  if (!configuracaoAmbiente.IDENTIFICADOR_PLANILHA) throw new Error('SPREADSHEET_ID não configurado.')
  const registro = prepararRegistroOperacional(dados, usuario)
  const nomeAba = configuracaoAmbiente.ABA_OPERACIONAL
  const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
  const abasAtuais = await obterAbasPlanilha()
  if (!abasAtuais.some((aba) => aba.title === nomeAba)) {
    await servicoPlanilhas.spreadsheets.batchUpdate({
      spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
      requestBody: { requests: [{ addSheet: { properties: { title: nomeAba } } }] }
    })
  }
  await servicoPlanilhas.spreadsheets.values.update({
    spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
    range: `'${nomeAbaSeguro(nomeAba)}'!A1:T1`,
    valueInputOption: 'RAW',
    requestBody: { values: [CABECALHO_OPERACIONAL] }
  })
  const valores = [registro.assistencia, registro.barra, registro.outraAssist, registro.servico, registro.cidade, registro.uf,
    registro.cliente, registro.dataHoraSolicitacao, registro.dataHoraRetorno, registro.tempoRetorno, registro.porQuePedimosAuxilio,
    registro.faixaRetorno, registro.houveAtuacaoRede, registro.retornoAuxilio, registro.servicoBaseIndicada,
    registro.resolucaoAcionamento, registro.baseAcionada, registro.barra, registro.respondidoPor, registro.adm]
  const resposta = await servicoPlanilhas.spreadsheets.values.append({
    spreadsheetId: configuracaoAmbiente.IDENTIFICADOR_PLANILHA,
    range: `'${nomeAbaSeguro(nomeAba)}'!A:T`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [valores] }
  })
  return { registro, linha: resposta.data.updates?.updatedRange || null, aba: nomeAba }
}
