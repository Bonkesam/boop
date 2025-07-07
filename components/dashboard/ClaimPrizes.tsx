'use client';
import { useContractWrite } from '@/hooks/useContractWrite';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { formatEther } from 'viem';
import { Button } from './Button';

interface ClaimPrizesProps {
  claims?: number;
  totalClaimed?: number;
}

export function ClaimPrizes({ claims = 0, totalClaimed = 0 }: ClaimPrizesProps) {
  const { write, isLoading, error } = useContractWrite('PRIZE_POOL', 'claimPrize');
  
  const hasClaims = claims > 0;
  const formattedClaims = formatEther(BigInt(claims * 1e18));
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Claim Prizes</h2>
        
        <div className="bg-indigo-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-indigo-700">Pending Claims</p>
              <p className="text-2xl font-bold text-indigo-900">
                {formattedClaims} ETH
              </p>
            </div>
            <BanknotesIcon className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Total Claimed</span>
          <span className="font-medium">{totalClaimed.toFixed(4)} ETH</span>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        )}
        
        <Button
          onClick={() => write()}
          disabled={!hasClaims || isLoading}
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          {hasClaims ? `Claim ${formattedClaims} ETH` : 'No Pending Claims'}
        </Button>
      </div>
    </div>
  );
}