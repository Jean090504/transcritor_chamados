import { google } from 'googleapis'
import { configuracaoAmbiente } from '../config/env.js'
import { autenticacaoGoogle, obterAbasPlanilha } from '../model/Chamado.js'
import { prisma } from './prisma.js'
import { CABECALHO_OPERACIONAL, prepararRegistroOperacional } from './operacionalService.js'

function nomeAbaSeguro(nome) { return String(nome).replace(/'/g, "''") }

function resumirHistorico(registro) {
  const dados = registro.dados && typeof registro.dados === 'object' ? registro.dados : {}
  return {
    id: registro.id,
    chaveIdempotencia: registro.chaveIdempotencia,
    protocolo: registro.protocolo,
    assistencia: dados.assistencia || '',
    servico: dados.servico || '',
    status: registro.status,
    linhaPlanilha: registro.linhaPlanilha,
    erro: registro.erro,
    criadoEm: registro.criadoEm.toISOString(),
    dados
  }
}

export async function listarHistoricoOperacional(username, limite = 20) {
  const registros = await prisma.registroOperacional.findMany({
    where: { username },
    orderBy: { criadoEm: 'desc' },
    take: Math.min(Math.max(Number(limite) || 20, 1), 50)
  })
  return registros.map(resumirHistorico)
}

export async function salvarRegistroOperacionalSeguro(dados, usuario, chaveIdempotencia) {
  if (!configuracaoAmbiente.IDENTIFICADOR_PLANILHA) throw new Error('SPREADSHEET_ID não configurado.')
  const registro = prepararRegistroOperacional(dados, usuario)
  const dadosOriginais = { ...dados, respondidoPor: usuario?.nome || '', adm: usuario?.nome || '' }
  const existente = await prisma.registroOperacional.findUnique({ where: { chaveIdempotencia } })
  if (existente?.status === 'ENVIADO') return { registro, linha: existente.linhaPlanilha, duplicado: true, historico: resumirHistorico(existente) }
  if (existente?.status === 'PROCESSANDO') {
    const erro = new Error('ENVIO_EM_PROCESSAMENTO')
    erro.codigo = 'ENVIO_EM_PROCESSAMENTO'
    throw erro
  }
  const reserva = existente
    ? await prisma.registroOperacional.update({ where: { id: existente.id }, data: { status: 'PROCESSANDO', erro: null, dados: dadosOriginais, protocolo: registro.protocolo } })
    : await prisma.registroOperacional.create({ data: { chaveIdempotencia, username: usuario.sub, protocolo: registro.protocolo, dados: dadosOriginais } })
  const nomeAba = configuracaoAmbiente.ABA_OPERACIONAL
  const servicoPlanilhas = google.sheets({ version: 'v4', auth: autenticacaoGoogle })
  try {
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
    const linha = resposta.data.updates?.updatedRange || null
    const finalizado = await prisma.registroOperacional.update({ where: { id: reserva.id }, data: { status: 'ENVIADO', linhaPlanilha: linha, erro: null } })
    return { registro, linha, aba: nomeAba, historico: resumirHistorico(finalizado) }
  } catch (erro) {
    await prisma.registroOperacional.update({ where: { id: reserva.id }, data: { status: 'FALHA', erro: String(erro.message || 'Falha ao enviar').slice(0, 500) } }).catch(() => {})
    throw erro
  }
}
