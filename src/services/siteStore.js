import { prisma } from './prisma.js'
import { classificarChamado } from './statusChamado.js'

function serializarChamado(chamado) {
  return { ...chamado, criadoEm: chamado.criadoEm.toISOString(), classificacao: classificarChamado(chamado) }
}

export async function listarChamados(username) {
  // TODO(performance): endpoints de histórico/detalhes retornam a coleção inteira.
  // Adicionar paginação e selecionar somente os campos necessários para evitar
  // respostas e uso de memória proporcionais a todo o histórico do analista.
  const chamados = await prisma.chamado.findMany({
    where: { username },
    orderBy: { criadoEm: 'desc' }
  })
  return chamados.map(serializarChamado)
}

export async function listarChamadosPorUsuarios(usernames) {
  if (!usernames?.length) return []
  const chamados = await prisma.chamado.findMany({
    where: { username: { in: usernames } },
    orderBy: { criadoEm: 'desc' }
  })
  return chamados.map(serializarChamado)
}

export async function todosChamados() {
  // TODO(performance): usado hoje apenas para contar no dashboard, mas retorna
  // todas as colunas e linhas. Preferir count/groupBy quando esse uso for mantido.
  const chamados = await prisma.chamado.findMany({ orderBy: { criadoEm: 'desc' } })
  return chamados.map(serializarChamado)
}

export async function contarPorData(data, usernames) {
  return prisma.chamado.count({ where: { dataAtendimento: data, ...(usernames?.length ? { username: { in: usernames } } : {}) } })
}

export async function contarChamadosHoje(username, data) {
  return prisma.chamado.count({ where: { username, dataAtendimento: data } })
}

export function classificarAtendimento(chamado) {
  return classificarChamado(chamado)
}

async function contarStatusChamados(where) {
  const resultado = { acionados: 0, pendentes: 0, cancelados: 0 }
  const chamados = await prisma.chamado.findMany({
    where,
    select: { servico: true, previaServico: true, baseAcionada: true, retratacaoInicial: true, retratacaoFinal: true, resumoTentativas: true, observacao: true }
  })
  chamados.forEach((chamado) => { resultado[classificarAtendimento(chamado)] += 1 })
  return resultado
}

export async function contarStatusChamadosHoje(username, data) {
  return contarStatusChamados({ username, dataAtendimento: data })
}

export async function contarStatusAtendimentosHoje(usernames, data) {
  if (!usernames?.length) return { acionados: 0, pendentes: 0, cancelados: 0 }
  return contarStatusChamados({ dataAtendimento: data, username: { in: usernames } })
}

function adicionarDias(data, quantidade) {
  const dia = new Date(`${data}T12:00:00Z`)
  dia.setUTCDate(dia.getUTCDate() + quantidade)
  return dia.toISOString().slice(0, 10)
}

export async function obterResumoPeriodo(usernames, inicio, fim) {
  const serieDiaria = []
  for (let data = inicio; data <= fim; data = adicionarDias(data, 1)) {
    serieDiaria.push({ data, total: 0, acionados: 0, agendados: 0, cancelados: 0 })
  }
  if (!usernames?.length) return { serieDiaria, resumo: { total: 0, acionados: 0, agendados: 0, cancelados: 0 } }

  const chamados = await prisma.chamado.findMany({
    where: { dataAtendimento: { gte: inicio, lte: fim }, username: { in: usernames } },
    select: { dataAtendimento: true, servico: true, previaServico: true, baseAcionada: true, retratacaoInicial: true, retratacaoFinal: true, resumoTentativas: true, observacao: true }
  })
  const porData = new Map(serieDiaria.map((item) => [item.data, item]))
  const resumo = { total: chamados.length, acionados: 0, agendados: 0, cancelados: 0 }
  chamados.forEach((chamado) => {
    const dia = porData.get(chamado.dataAtendimento)
    if (!dia) return
    dia.total += 1
    const categoria = classificarAtendimento(chamado)
    const chave = categoria === 'pendentes' ? 'agendados' : categoria
    dia[chave] += 1
    resumo[chave] += 1
  })
  return { serieDiaria, resumo }
}

export async function existeProtocolo(username, protocolo) {
  const chamado = await prisma.chamado.findFirst({ where: { username, protocolo } })
  return chamado ? serializarChamado(chamado) : null
}

export async function salvarChamado(username, nome, dados, dataAtendimento) {
  const chamado = await prisma.chamado.create({
    data: { username, nome, ...dados, dataAtendimento }
  })
  return serializarChamado(chamado)
}

export async function apagarChamado(username, id) {
  const resultado = await prisma.chamado.deleteMany({ where: { username, id } })
  return resultado.count > 0
}

export async function atualizarChamado(username, id, dados) {
  const resultado = await prisma.chamado.updateMany({ where: { username, id }, data: dados })
  if (!resultado.count) return null
  const chamado = await prisma.chamado.findFirst({ where: { username, id } })
  return chamado ? serializarChamado(chamado) : null
}
