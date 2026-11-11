import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { ANALISTAS } from '../src/config/analistas.js'

const arquivoUsuarios = path.resolve('data', 'users.json')

const usuarios = [
  { username: 'root', nome: 'ADMINISTRADOR', papel: 'root', aba: null },
  { username: 'sarah.fernandes', nome: 'SARAH SILVA DA COSTA FERNANDES', papel: 'supervisor', aba: null },
  { username: 'junaide.auzeni', nome: 'JUNAIDE AUZENI DE SOUSA', papel: 'supervisor', aba: null },
  ...ANALISTAS.map((analista) => ({ ...analista, papel: 'analista' }))
]

function senhaAleatoria() { return crypto.randomBytes(9).toString('base64url') }
function hash(senha) { const salt = crypto.randomBytes(16).toString('hex'); return `${salt}:${crypto.scryptSync(senha, salt, 64).toString('hex')}` }

const senhas = []
const configuracao = usuarios.map((usuario) => {
  const senha = senhaAleatoria()
  senhas.push(`${usuario.username}: ${senha}`)
  return { ...usuario, senhaHash: hash(senha), trocarSenha: true }
})

fs.mkdirSync(path.resolve('data'), { recursive: true })
fs.writeFileSync(arquivoUsuarios, JSON.stringify(configuracao, null, 2), { mode: 0o600 })
fs.writeFileSync(path.resolve('senhas-iniciais.txt'), `Senhas iniciais - trocar no primeiro login\nGerado em ${new Date().toISOString()}\n\n${senhas.join('\n')}\n`, { mode: 0o600 })
console.log(`Usuários gerados: ${configuracao.length}`)
console.log('Senhas salvas em senhas-iniciais.txt')
