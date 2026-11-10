import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { configuracaoAmbiente } from '../config/env.js'
import { ANALISTAS, USUARIOS_GLOBAIS } from '../config/analistas.js'
import { prisma } from './prisma.js'

const ultimaAtividade = new Map()

function compararSenha(senha, hashArmazenado) {
  if (!senha || !hashArmazenado) return false
  const [salt, digest] = String(hashArmazenado).split(':')
  if (!salt || !digest) return false
  const calculado = crypto.scryptSync(senha, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(calculado, 'hex'), Buffer.from(digest, 'hex'))
}

function criarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex')
  return `${salt}:${crypto.scryptSync(senha, salt, 64).toString('hex')}`
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
    acessoGlobal: papel === 'root' || papel === 'sarah',
    precisaTrocarSenha: configurado.trocarSenha !== false
  }
  return { usuario: payload, token: jwt.sign(payload, configuracaoAmbiente.JWT_SECRET, { expiresIn: '8h' }) }
}

export async function alterarSenha(username, novaSenha) {
  if (!novaSenha || novaSenha.length < 8) throw new Error('A nova senha precisa ter pelo menos 8 caracteres.')
  const usuario = await prisma.usuario.findUnique({ where: { username } })
  if (!usuario) throw new Error('UsuÃ¡rio nÃ£o encontrado.')
  const atualizado = await prisma.usuario.update({
    where: { username },
    data: { senhaHash: criarHashSenha(novaSenha), trocarSenha: false }
  })
  return jwt.sign({ sub: username, nome: atualizado.nome, papel: atualizado.papel, aba: atualizado.aba || null, acessoGlobal: atualizado.papel === 'root' || atualizado.papel === 'sarah', precisaTrocarSenha: false }, configuracaoAmbiente.JWT_SECRET, { expiresIn: '8h' })
}

export function exigirAutenticacao(requisicao, resposta, proximo) {
  const cabecalho = requisicao.headers.authorization || ''
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null
  if (!token) return resposta.status(401).json({ erro: 'AutenticaÃ§Ã£o necessÃ¡ria.' })
  try {
    requisicao.usuario = jwt.verify(token, configuracaoAmbiente.JWT_SECRET)
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
    return resposta.status(403).json({ erro: 'Acesso permitido somente para Sarah ou root.' })
  }
  return proximo()
}
