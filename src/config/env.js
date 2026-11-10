import dotenv from 'dotenv'
import { z as zodValidacao } from 'zod'

dotenv.config()

const esquemaAmbiente = zodValidacao.object({
  PORTA: zodValidacao.string().default('3000'),
  CHAVE_API_GEMINI: zodValidacao.string().min(1, 'CHAVE_API_GEMINI e obrigatoria'),
  IDENTIFICADOR_PLANILHA: zodValidacao.string().default(''),
  JWT_SECRET: zodValidacao.string().min(32, 'JWT_SECRET precisa ter pelo menos 32 caracteres')
})

const ambienteValidado = esquemaAmbiente.safeParse({
  PORTA: process.env.PORT,
  CHAVE_API_GEMINI: process.env.GEMINI_API_KEY,
  IDENTIFICADOR_PLANILHA: process.env.SPREADSHEET_ID,
  JWT_SECRET: process.env.JWT_SECRET
})

if (!ambienteValidado.success) {
  console.error('Configuracoes de ambiente invalidas:', ambienteValidado.error.format())
  process.exit(1)
}

export const configuracaoAmbiente = ambienteValidado.data
