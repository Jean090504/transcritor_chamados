import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { configuracaoAmbiente } from '../config/env.js'
import { ANALISTAS, USUARIOS_GLOBAIS, obterAnalistasVisiveis } from '../config/analistas.js'
import { prisma } from './prisma.js'

const ultimaAtividade = new Map()

function compararSenha(senha, hashArmazenado) {
  if (!senha || !hashArmazenado) return false
  const [salt, digest] = String(hashArmazenado).split(':')
  if (!salt || !digest) return false
  try {
    const calculado = crypto.scryptSync(senha, salt, 64).toString('hex')
    const esperado = Buffer.from(digest, 'hex')
    const derivado = Buffer.from(calculado, 'hex')
    return esperado.length === derivado.length && crypto.timingSafeEqual(derivado, esperado)
  } catch {
    return false
  }
}

function criarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex')
  return `${salt}:${crypto.scryptSync(senha, salt, 64).toString('hex')}`
}

function criarSenhaTemporaria() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  return Array.from({ length: 12 }, () => caracteres[crypto.randomInt(0, caracteres.length)]).join('')
}

function formatarSolicitacaoReset(solicitacao) {
  return {
    id: solicitacao.id,
    username: solicitacao.username,
    nome: solicitacao.usuario.nome,
    status: solicitacao.status,
    solicitadoEm: solicitacao.solicitadoEm.toISOString(),
    resolvidoEm: solicitacao.resolvidoEm?.toISOString() || null,
    resolvidoPor: solicitacao.resolvidoPor || null
  }
}

export async function solicitarResetSenha(username) {
  const usuario = await prisma.usuario.findUnique({ where: { username }, select: { username: true } })
  if (!usuario) return
  const pendente = await prisma.solicitacaoResetSenha.findFirst({ where: { username, status: 'PENDENTE' } })
  if (!pendente) await prisma.solicitacaoResetSenha.create({ data: { username } })
}

export async function listarSolicitacoesReset(usuario) {
  const usernames = usuario?.papel === 'root'
    ? undefined
    : obterAnalistasVisiveis(usuario).map((analista) => analista.username)
  if (usernames && !usernames.length) return []
  const solicitacoes = await prisma.solicitacaoResetSenha.findMany({
    where: { status: 'PENDENTE', ...(usernames ? { username: { in: usernames } } : {}) },
    include: { usuario: { select: { nome: true } } },
    orderBy: { solicitadoEm: 'asc' }
  })
  return solicitacoes.map(formatarSolicitacaoReset)
}

export async function aprovarSolicitacaoReset(id, usuarioAprovador) {
  const senhaTemporaria = criarSenhaTemporaria()
  const usernamesPermitidos = usuarioAprovador?.papel === 'root'
    ? null
    : obterAnalistasVisiveis(usuarioAprovador).map((analista) => analista.username)
  const resultado = await prisma.$transaction(async (transacao) => {
    const solicitacao = await transacao.solicitacaoResetSenha.findUnique({ where: { id }, include: { usuario: true } })
    if (!solicitacao || solicitacao.status !== 'PENDENTE') throw new Error('SOLICITACAO_NAO_PENDENTE')
    if (usernamesPermitidos && !usernamesPermitidos.includes(solicitacao.username)) throw new Error('ACESSO_NEGADO')
    const atualizacao = await transacao.solicitacaoResetSenha.updateMany({
      where: { id, status: 'PENDENTE' },
      data: { status: 'APROVADA', resolvidoEm: new Date(), resolvidoPor: usuarioAprovador.sub }
    })
    if (!atualizacao.count) throw new Error('SOLICITACAO_NAO_PENDENTE')
    await transacao.usuario.update({
      where: { username: solicitacao.username },
      data: { senhaHash: criarHashSenha(senhaTemporaria), trocarSenha: true, tokenVersao: { increment: 1 } }
    })
    return solicitacao
  })
  return { username: resultado.username, nome: resultado.usuario.nome, senhaTemporaria }
}

export async function rejeitarSolicitacaoReset(id, usuarioAprovador) {
  const usernamesPermitidos = usuarioAprovador?.papel === 'root'
    ? null
    : obterAnalistasVisiveis(usuarioAprovador).map((analista) => analista.username)
  const solicitacao = await prisma.solicitacaoResetSenha.findUnique({ where: { id } })
  if (!solicitacao || solicitacao.status !== 'PENDENTE') throw new Error('SOLICITACAO_NAO_PENDENTE')
  if (usernamesPermitidos && !usernamesPermitidos.includes(solicitacao.username)) throw new Error('ACESSO_NEGADO')
  await prisma.solicitacaoResetSenha.update({
    where: { id },
    data: { status: 'REJEITADA', resolvidoEm: new Date(), resolvidoPor: usuarioAprovador.sub }
  })
}

export async function listarUsuariosPublicos() {
  const configurados = await prisma.usuario.findMany({ select: { username: true, senhaHash: true } })
  return [...USUARIOS_GLOBAIS, ...ANALISTAS.filter((analista) => !USUARIOS_GLOBAIS.some((u) => u.username === analista.username))]
    .map((usuario) => {
      const configurado = configurados.find((item) => item.username === usuario.username)
      return { ...usuario, configurado: Boolean(configurado?.senhaHash) }
    })
}

export async function autenticarUsuario(username, senha) {
  const usuarioBase = [...USUARIOS_GLOBAIS, ...ANALISTAS].find((item) => item.username === username)
  const configurado = await prisma.usuario.findUnique({ where: { username } })
  if (!usuarioBase || !configurado || !compararSenha(senha, configurado.senhaHash)) return null

  const papel = usuarioBase.papel || 'analista'
  ultimaAtividade.set(usuarioBase.username, Date.now())
  const payload = {
    sub: usuarioBase.username,
    nome: usuarioBase.nome,
    papel,
    aba: usuarioBase.aba || null,
    acessoGlobal: papel === 'root',
    acessoDashboard: papel === 'root' || papel === 'supervisor',
    precisaTrocarSenha: configurado.trocarSenha !== false,
    tokenVersao: configurado.tokenVersao
  }
  return { usuario: payload, token: jwt.sign(payload, configuracaoAmbiente.JWT_SECRET, { expiresIn: '8h' }) }
}

export async function alterarSenha(username, novaSenha) {
  if (!novaSenha || novaSenha.length < 8) throw new Error('A nova senha precisa ter pelo menos 8 caracteres.')
  const usuario = await prisma.usuario.findUnique({ where: { username } })
  if (!usuario) throw new Error('UsuÃ¡rio nÃ£o encontrado.')
  const atualizado = await prisma.usuario.update({
    where: { username },
    data: { senhaHash: criarHashSenha(novaSenha), trocarSenha: false, tokenVersao: { increment: 1 } }
  })
  return jwt.sign({ sub: username, nome: atualizado.nome, papel: atualizado.papel, aba: atualizado.aba || null, acessoGlobal: atualizado.papel === 'root', acessoDashboard: atualizado.papel === 'root' || atualizado.papel === 'supervisor', precisaTrocarSenha: false, tokenVersao: atualizado.tokenVersao }, configuracaoAmbiente.JWT_SECRET, { expiresIn: '8h' })
}

export async function exigirAutenticacao(requisicao, resposta, proximo) {
  const cabecalho = requisicao.headers.authorization || ''
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null
  if (!token) return resposta.status(401).json({ erro: 'AutenticaÃ§Ã£o necessÃ¡ria.' })
  try {
    requisicao.usuario = jwt.verify(token, configuracaoAmbiente.JWT_SECRET)
    const usuarioAtual = await prisma.usuario.findUnique({ where: { username: requisicao.usuario.sub }, select: { tokenVersao: true } })
    if (!usuarioAtual || usuarioAtual.tokenVersao !== requisicao.usuario.tokenVersao) return resposta.status(401).json({ erro: 'SessÃ£o expirada. Entre novamente.' })
    ultimaAtividade.set(requisicao.usuario.sub, Date.now())
    return proximo()
  } catch {
    return resposta.status(401).json({ erro: 'Token invÃ¡lido ou expirado.' })
  }
}

function textoAtividade(timestamp) {
  if (!timestamp) return 'Disponível'
  const minutos = Math.floor((Date.now() - timestamp) / 60000)
  if (minutos <= 30) return `Ativo há ${minutos} min`
  return 'Disponível'
}

export function obterStatusAnalistas() {
  return ANALISTAS.map((analista) => ({
    username: analista.username,
    nome: analista.nome,
    aba: analista.aba,
    status: textoAtividade(ultimaAtividade.get(analista.username))
  }))
}

export function exigirAcessoGlobal(requisicao, resposta, proximo) {
  if (!requisicao.usuario?.acessoGlobal) {
    return resposta.status(403).json({ erro: 'Acesso permitido somente para root.' })
  }
  return proximo()
}

export function exigirAcessoDashboard(requisicao, resposta, proximo) {
  if (!requisicao.usuario?.acessoDashboard) return resposta.status(403).json({ erro: 'Acesso permitido somente para supervisores ou root.' })
  return proximo()
}
