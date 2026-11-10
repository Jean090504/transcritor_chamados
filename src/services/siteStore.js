import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const arquivoChamados = path.resolve(process.cwd(), 'data', 'chamados.json')

function lerChamados() {
  if (!fs.existsSync(arquivoChamados)) return []
  try { return JSON.parse(fs.readFileSync(arquivoChamados, 'utf8')) } catch { return [] }
}

function salvarChamados(chamados) {
  fs.mkdirSync(path.dirname(arquivoChamados), { recursive: true })
  const temporario = `${arquivoChamados}.tmp`
  fs.writeFileSync(temporario, JSON.stringify(chamados, null, 2), { encoding: 'utf8', mode: 0o600 })
  fs.renameSync(temporario, arquivoChamados)
}

export function listarChamados(username) {
  return lerChamados().filter((chamado) => chamado.username === username).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
}

export function todosChamados() { return lerChamados() }

export function contarPorData(data) { return todosChamados().filter((chamado) => chamado.dataAtendimento === data).length }

export function contarChamadosHoje(username, data) {
  return listarChamados(username).filter((chamado) => chamado.dataAtendimento === data).length
}

export function existeProtocolo(username, protocolo) {
  return listarChamados(username).find((chamado) => chamado.protocolo === protocolo) || null
}

export function salvarChamado(username, nome, dados, dataAtendimento) {
  const chamados = lerChamados()
  const chamado = { id: crypto.randomUUID(), username, nome, ...dados, dataAtendimento, criadoEm: new Date().toISOString() }
  chamados.push(chamado)
  salvarChamados(chamados)
  return chamado
}

export function apagarChamado(username, id) {
  const chamados = lerChamados()
  const restantes = chamados.filter((chamado) => !(chamado.username === username && chamado.id === id))
  if (restantes.length === chamados.length) return false
  salvarChamados(restantes)
  return true
}
