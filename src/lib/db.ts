import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Don't initialize Prisma during build time
const isBuildTime = process.env.NEXT_PHASE?.includes('build')

export const db =
  globalForPrisma.prisma ??
  (isBuildTime ? null : new PrismaClient({
    log: ['query'],
  }))

if (process.env.NODE_ENV !== 'production' && !isBuildTime) {
  globalForPrisma.prisma = db
}