'use client';
import { ClaimPrizes } from '@/components/dashboard/ClaimPrizes';
import { CurrentLotteryCard } from '@/components/dashboard/CurrentLotteryCard';
import { DashboardStats } from '@/components/dashboard/DashBoardStats';
import { LoadingSkeleton } from '@/components/dashboard/LoadingSkeleton';
import { LoyaltyStatus } from '@/components/dashboard/LoyaltyStatus';
import { MyTickets } from '@/components/dashboard/MyTickets';
import { TicketPurchase } from '@/components/dashboard/TicketPurchase';
import { useUserDashboardData } from '@/hooks/useuserDashboardData';
import { useAccount } from 'wagmi';

export default function DashboardPage() {
  const { address } = useAccount();
  const { data, isLoading, error } = useUserDashboardData(address);

  if (!address) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600">
          Please connect your wallet to access the dashboard
        </p>
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton />;
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          Error loading dashboard data: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardStats stats={data?.stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <CurrentLotteryCard 
            draw={data?.currentDraw} 
            ticketPrice={data?.ticketPrice}
          />
          <TicketPurchase 
            ticketPrice={data?.ticketPrice}
            maxTickets={10}
          />
          <ClaimPrizes 
            claims={data?.pendingClaims} 
            totalClaimed={data?.totalClaimed}
          />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <LoyaltyStatus 
            tier={data?.loyaltyTier} 
            discount={data?.discount} 
            lossStreak={data?.lossStreak}
          />
          <MyTickets tickets={data?.recentTickets} />
        </div>
      </div>
    </div>
  );
}