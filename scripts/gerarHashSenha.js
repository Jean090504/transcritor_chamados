import crypto from 'crypto'

const senha = process.argv[2]
if (!senha || senha.length < 8) {
  console.error('Uso: node scripts/gerarHashSenha.js "uma-senha-com-8-ou-mais-caracteres"')
  process.exit(1)
}

const salt = crypto.randomBytes(16).toString('hex')
const hash = crypto.scryptSync(senha, salt, 64).toString('hex')
console.log(`${salt}:${hash}`)
