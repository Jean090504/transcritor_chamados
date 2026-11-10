import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import { configuracaoAmbiente } from '../config/env.js'
import { ANALISTAS, USUARIOS_GLOBAIS } from '../config/analistas.js'
import { diretorioDados } from '../config/storage.js'

const ultimaAtividade = new Map()
const arquivoUsuarios = path.join(diretorioDados, 'users.json')

function compararSenha(senha, hashArmazenado) {
  if (!senha || !hashArmazenado) return false
  const [salt, digest] = String(hashArmazenado).split(':')
  if (!salt || !digest) return false
  const calculado = crypto.scryptSync(senha, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(calculado, 'hex'), Buffer.from(digest, 'hex'))
}

function carregarUsuarios() {
  if (fs.existsSync(arquivoUsuarios)) return JSON.parse(fs.readFileSync(arquivoUsuarios, 'utf8'))
  try {
    const configurados = JSON.parse(process.env.AUTH_USERS_JSON || '[]')
    return Array.isArray(configurados) ? configurados : []
  } catch {
    throw new Error('AUTH_USERS_JSON precisa ser um JSON válido.')
  }
}

function salvarUsuarios(usuarios) {
  fs.mkdirSync(path.dirname(arquivoUsuarios), { recursive: true })
  fs.writeFileSync(arquivoUsuarios, JSON.stringify(usuarios, null, 2), { encoding: 'utf8', mode: 0o600 })
}

function criarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex')
  return `${salt}:${crypto.scryptSync(senha, salt, 64).toString('hex')}`
}

export function listarUsuariosPublicos() {
  const configurados = carregarUsuarios()
  return [...USUARIOS_GLOBAIS, ...ANALISTAS.filter((analista) => !USUARIOS_GLOBAIS.some((u) => u.username === analista.username))]
    .map((usuario) => {
      const configurado = configurados.find((item) => item.username === usuario.username)
      return { ...usuario, configurado: Boolean(configurado?.senhaHash) }
    })
}

export function autenticarUsuario(username, senha) {
  const usuarioBase = [...USUARIOS_GLOBAIS, ...ANALISTAS].find((item) => item.username === username)
  const configurado = carregarUsuarios().find((item) => item.username === username)
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

export function alterarSenha(username, novaSenha) {
  if (!novaSenha || novaSenha.length < 8) throw new Error('A nova senha precisa ter pelo menos 8 caracteres.')
  const usuarios = carregarUsuarios()
  const usuario = usuarios.find((item) => item.username === username)
  if (!usuario) throw new Error('Usuário não encontrado.')
  usuario.senhaHash = criarHashSenha(novaSenha)
  usuario.trocarSenha = false
  salvarUsuarios(usuarios)
  return jwt.sign({ sub: username, nome: usuario.nome, papel: usuario.papel, aba: usuario.aba || null, acessoGlobal: usuario.papel === 'root' || usuario.papel === 'sarah', precisaTrocarSenha: false }, configuracaoAmbiente.JWT_SECRET, { expiresIn: '8h' })
}

export function exigirAutenticacao(requisicao, resposta, proximo) {
  const cabecalho = requisicao.headers.authorization || ''
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null
  if (!token) return resposta.status(401).json({ erro: 'Autenticação necessária.' })
  try {
    requisicao.usuario = jwt.verify(token, configuracaoAmbiente.JWT_SECRET)
    ultimaAtividade.set(requisicao.usuario.sub, Date.now())
    return proximo()
  } catch {
    return resposta.status(401).json({ erro: 'Token inválido ou expirado.' })
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
