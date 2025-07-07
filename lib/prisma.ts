import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Add database extensions for performance
prisma.$extends({
  query: {
    user: {
      async findUnique({ args, query }) {
        // Optimize queries by always including frequently used relations
        args.include = {
          tickets: { take: 5, orderBy: { mintedAt: 'desc' } },
          wins: true,
          refundClaims: true,
          ...args.include
        };
        return query(args);
      },
    },
    lotteryDraw: {
      async findMany({ args, query }) {
        // Only fetch active draws by default
        args.where = {
          status: { not: 'COMPLETED' },
          ...args.where
        };
        return query(args);
      }
    }
  },
  result: {
    user: {
      loyaltyTier: {
        needs: { discount: true },
        compute(user) {
          return Math.floor((user.discount || 0) / 5);
        },
      },
    },
  },
});

export default prisma;