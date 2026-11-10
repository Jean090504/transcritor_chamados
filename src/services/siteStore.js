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

export async function contarPorData(data) {
  return prisma.chamado.count({ where: { dataAtendimento: data } })
}

export async function contarChamadosHoje(username, data) {
  return prisma.chamado.count({ where: { username, dataAtendimento: data } })
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
