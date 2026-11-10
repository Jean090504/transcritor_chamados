import { PrismaClient } from '@prisma/client'

const prismaGlobal = globalThis

export const prisma = prismaGlobal.__transcritorPrisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.__transcritorPrisma = prisma
}
