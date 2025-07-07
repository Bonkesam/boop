import { Progress } from './Progress';

interface LoyaltyStatusProps {
  tier?: number;
  discount?: number;
  lossStreak?: number;
  nextTierThreshold?: number;
}

export function LoyaltyStatus({ 
  tier = 0, 
  discount = 0, 
  lossStreak = 0,
  nextTierThreshold = 100
}: LoyaltyStatusProps) {
  const tierNames = ["Bronze", "Silver", "Gold", "Platinum"];
  const tierColors = ["bg-amber-500", "bg-gray-300", "bg-yellow-400", "bg-indigo-400"];
  
  const currentTierName = tierNames[Math.min(tier, tierNames.length - 1)] || "Bronze";
  const currentTierColor = tierColors[Math.min(tier, tierColors.length - 1)] || "bg-amber-500";
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Loyalty Status</h2>
        
        <div className="flex items-center mb-6">
          <div className={`w-12 h-12 rounded-full ${currentTierColor} flex items-center justify-center mr-4`}>
            <span className="text-white font-bold text-lg">{tier}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{currentTierName} Tier</h3>
            <p className="text-sm text-gray-600">{discount}% Discount on Tickets</p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress to Next Tier</span>
            <span>{nextTierThreshold} Tickets</span>
          </div>
          <Progress value={Math.min(100, (lossStreak / nextTierThreshold) * 100)} />
        </div>
        
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 text-sm mb-1">Lossless Protection</h3>
          <p className="text-xs text-yellow-700">
            Current loss streak: {lossStreak} tickets
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            After 10 consecutive losses, you'll receive a refund of 50 FORT tokens.
          </p>
        </div>
      </div>
    </div>
  );
}