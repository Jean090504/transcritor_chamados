import fs from 'fs'
import path from 'path'
import { prisma } from '../src/services/prisma.js'
import { USUARIOS_OPERACIONAIS_INICIAIS } from '../src/config/usuariosOperacionaisIniciais.js'

function carregarUsuarios() {
  const arquivoLocal = path.resolve(process.cwd(), 'data', 'users.json')
  if (fs.existsSync(arquivoLocal)) return JSON.parse(fs.readFileSync(arquivoLocal, 'utf8'))
  const configurados = JSON.parse(process.env.AUTH_USERS_JSON || '[]')
  return Array.isArray(configurados) ? configurados : []
}

const usuariosConfigurados = carregarUsuarios()
const usernamesConfigurados = new Set(usuariosConfigurados.map((usuario) => usuario.username))
const usuarios = [
  ...usuariosConfigurados,
  ...USUARIOS_OPERACIONAIS_INICIAIS.filter((usuario) => !usernamesConfigurados.has(usuario.username))
]

if (!usuarios.length) {
  throw new Error('Nenhum usuário encontrado. Configure AUTH_USERS_JSON ou data/users.json.')
}

for (const usuario of usuarios) {
  await prisma.usuario.upsert({
    where: { username: usuario.username },
    create: {
      username: usuario.username,
      nome: usuario.nome,
      papel: usuario.papel,
      aba: usuario.aba,
      senhaHash: usuario.senhaHash,
      trocarSenha: usuario.trocarSenha !== false
    },
    update: {
      nome: usuario.nome,
      papel: usuario.papel,
      aba: usuario.aba
    }
  })
}

console.log(`Usuários sincronizados no banco: ${usuarios.length}`)
await prisma.$disconnect()
