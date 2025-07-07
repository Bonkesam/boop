import { StatCard } from './StatCard';

interface DashboardStatsProps {
  stats?: {
    ticketsPurchased: number;
    drawsParticipated: number;
    totalWinnings: number;
    ticketsWon: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        title="Tickets Purchased" 
        value={stats.ticketsPurchased} 
        description="Total tickets bought"
      />
      <StatCard 
        title="Draws Participated" 
        value={stats.drawsParticipated} 
        description="Number of draws joined"
      />
      <StatCard 
        title="Total Winnings" 
        value={`${stats.totalWinnings.toFixed(4)} ETH`} 
        description="All-time winnings"
      />
      <StatCard 
        title="Tickets Won" 
        value={stats.ticketsWon} 
        description="Winning tickets"
      />
    </div>
  );
}