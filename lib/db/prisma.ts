import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

type PrismaClientLike = PrismaClient;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClientLike;
};

const REQUIRED_DELEGATES = ['user', 'wishlistItem'] as const;

function hasRequiredDelegates(client: PrismaClientLike) {
  return REQUIRED_DELEGATES.every((delegate) => typeof client?.[delegate] !== 'undefined');
}

function createPrismaClient(): PrismaClientLike {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required before Prisma Client can connect.');
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function getPrismaClient(): PrismaClientLike {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  if (!hasRequiredDelegates(globalForPrisma.prisma)) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClientLike, {
  get(_target, prop) {
    return getPrismaClient()[prop as keyof PrismaClientLike];
  },
});
