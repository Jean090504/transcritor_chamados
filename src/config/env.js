import dotenv from 'dotenv'
import { z as zodValidacao } from 'zod'

dotenv.config()

const esquemaAmbiente = zodValidacao.object({
  PORTA: zodValidacao.string().default('3000'),
  CHAVE_API_GEMINI: zodValidacao.string().min(1, 'CHAVE_API_GEMINI e obrigatoria'),
  MODELO_GEMINI: zodValidacao.string().default('gemini-3.5-flash-lite'),
  IDENTIFICADOR_PLANILHA: zodValidacao.string().default(''),
  ABA_OPERACIONAL: zodValidacao.string().default('OPERACIONAL'),
  JWT_SECRET: zodValidacao.string().min(32, 'JWT_SECRET precisa ter pelo menos 32 caracteres'),
  DATABASE_URL: zodValidacao.string().min(1, 'DATABASE_URL e obrigatoria')
})

const ambienteValidado = esquemaAmbiente.safeParse({
  PORTA: process.env.PORT,
  CHAVE_API_GEMINI: process.env.GEMINI_API_KEY,
  MODELO_GEMINI: process.env.GEMINI_MODEL,
  IDENTIFICADOR_PLANILHA: process.env.SPREADSHEET_ID,
  ABA_OPERACIONAL: process.env.OPERACIONAL_SHEET_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL
})

if (!ambienteValidado.success) {
  console.error('Configuracoes de ambiente invalidas:', ambienteValidado.error.format())
  process.exit(1)
}

export const configuracaoAmbiente = ambienteValidado.data
