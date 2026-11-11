import { prisma } from './prisma.js'

function serializarChamado(chamado) {
  return { ...chamado, criadoEm: chamado.criadoEm.toISOString() }
}

export async function listarChamados(username) {
  const chamados = await prisma.chamado.findMany({
    where: { username },
    orderBy: { criadoEm: 'desc' }
  })
  return chamados.map(serializarChamado)
}

export async function todosChamados() {
  const chamados = await prisma.chamado.findMany({ orderBy: { criadoEm: 'desc' } })
  return chamados.map(serializarChamado)
}

export async function contarPorData(data, usernames) {
  return prisma.chamado.count({ where: { dataAtendimento: data, ...(usernames?.length ? { username: { in: usernames } } : {}) } })
}

export async function contarChamadosHoje(username, data) {
  return prisma.chamado.count({ where: { username, dataAtendimento: data } })
}

function normalizarStatus(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function classificarAtendimento(chamado) {
  const base = normalizarStatus(chamado.baseAcionada)
  const estado = normalizarStatus(chamado.retratacaoFinal || chamado.retratacaoInicial)
  if (/cancelad/.test(`${base} ${estado}`)) return 'cancelados'
  if ((base && !/nao acionad|nao informado|sem acionamento/.test(base)) || estado.includes('acionad')) return 'acionados'
  return 'pendentes'
}

export async function contarStatusAtendimentosHoje(usernames, data) {
  const resultado = { acionados: 0, pendentes: 0, cancelados: 0 }
  if (!usernames?.length) return resultado
  const chamados = await prisma.chamado.findMany({
    where: { dataAtendimento: data, username: { in: usernames } },
    select: { baseAcionada: true, retratacaoInicial: true, retratacaoFinal: true }
  })
  chamados.forEach((chamado) => { resultado[classificarAtendimento(chamado)] += 1 })
  return resultado
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
