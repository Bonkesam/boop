// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getReadOnlyContract } from '@/lib/contracts';
import { ethers } from 'ethers';
import prisma from '@/lib/prisma';
import { formatEther } from 'viem';
import { DashboardData } from '@/types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    // Create a provider
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    
    // Fetch blockchain data
    const [fortContract, lotteryManager, prizePool, loyaltyTracker] = await Promise.all([
      getReadOnlyContract('FORT', provider),
      getReadOnlyContract('LOTTERY_MANAGER', provider),
      getReadOnlyContract('PRIZE_POOL', provider),
      getReadOnlyContract('LOYALTY_TRACKER', provider),
    ]);

    const [currentDrawId, ticketPrice, hasBetBefore] = await Promise.all([
      lotteryManager.currentDrawId(),
      lotteryManager.ticketPrice(),
      fortContract.hasBetBefore(address),
    ]);

    // Fetch current draw details
    const currentDraw = await lotteryManager.getCurrentDraw();
    
    // Fetch loyalty data
    const [discount, lossStreak] = await Promise.all([
      loyaltyTracker.getDiscount(address),
      loyaltyTracker.lossStreak(address),
    ]);

    // Fetch database data
    const dbData = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        tickets: {
          take: 5,
          orderBy: { mintedAt: 'desc' },
          include: { lottery: true }
        },
        wins: true,
        refundClaims: true,
      }
    });

    // Calculate stats
    const stats = {
      ticketsPurchased: dbData?.totalTickets || 0,
      drawsParticipated: dbData?.tickets?.length || 0,
      totalWinnings: dbData?.wins?.reduce((sum, win) => sum + win.amount, 0) || 0,
      ticketsWon: dbData?.wins?.length || 0,
    };

    // Calculate pending claims
    const pendingClaims = await prizePool.unclaimedPrizes(address);

    const dashboardData: DashboardData = {
      stats,
      currentDraw: {
        id: currentDrawId.toString(),
        endTime: new Date(Number(currentDraw.endTime) * 1000),
        status: Object.keys(currentDraw.phase)[currentDraw.phase] as any,
        prizePool: formatEther(await prizePool.prizeReserves()),
      },
      ticketPrice: formatEther(ticketPrice),
      loyaltyTier: Math.floor(Number(discount) / 5), // Tiers every 5%
      discount: Number(discount),
      lossStreak: Number(lossStreak),
      nextTierThreshold: 100, // Hardcoded for now
      pendingClaims: Number(formatEther(pendingClaims)),
      totalClaimed: dbData?.refundClaims?.reduce((sum, claim) => sum + claim.amount, 0) || 0,
      recentTickets: dbData?.tickets?.slice(0, 5) || [],
      hasBetBefore: Boolean(hasBetBefore),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}