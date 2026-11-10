import path from 'path'

const diretorioTemporarioVercel = path.join('/tmp', 'transcritor-chamados')

export const diretorioDados = process.env.DATA_DIR || (
  process.env.VERCEL
    ? diretorioTemporarioVercel
    : path.resolve(process.cwd(), 'data')
)
