import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { configuracaoAmbiente } from '../config/env.js'

const prismaGlobal = globalThis
const adaptadorPostgres = new PrismaPg({ connectionString: configuracaoAmbiente.DATABASE_URL })

export const prisma = prismaGlobal.__transcritorPrisma || new PrismaClient({ adapter: adaptadorPostgres })

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.__transcritorPrisma = prisma
}
