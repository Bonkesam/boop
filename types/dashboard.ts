export interface DashboardData {
  stats: {
    ticketsPurchased: number;
    drawsParticipated: number;
    totalWinnings: number;
    ticketsWon: number;
  };
  currentDraw: {
    id: string;
    endTime: Date;
    status: string;
    prizePool: string;
  };
  ticketPrice: string;
  loyaltyTier: number;
  discount: number;
  lossStreak: number;
  nextTierThreshold: number;
  pendingClaims: number;
  totalClaimed: number;
  recentTickets: Array<{
    id: string;
    tokenId: number;
    isGolden: boolean;
    isSilver: boolean;
    mintedAt: Date;
    lottery: {
      drawId: number;
      status: string;
    };
  }>;
  hasBetBefore: boolean;
}