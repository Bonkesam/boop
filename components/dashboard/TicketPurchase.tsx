'use client';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useContractWrite } from '@/hooks/useContractWrite';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from './Button';
import { ethers } from 'ethers';

interface TicketPurchaseProps {
  ticketPrice: string;
  maxTickets?: number;
}

export function TicketPurchase({ ticketPrice, maxTickets = 10 }: TicketPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  const { address } = useAccount();
  const { write, isLoading, error } = useContractWrite('LOTTERY_MANAGER', 'buyTickets');

  const handlePurchase = async () => {
    if (!address || !ticketPrice) return;
    
    const value = BigInt(quantity) * ethers.parseEther(ticketPrice);
    await write([quantity], { value });
  };

  const totalCost = quantity * parseFloat(ticketPrice);
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Buy Tickets</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Tickets
            </label>
            <div className="flex items-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-l-lg disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={maxTickets}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val <= maxTickets && val > 0) {
                    setQuantity(val);
                  }
                }}
                className="border-y border-gray-300 w-16 text-center py-2"
              />
              <button
                onClick={() => setQuantity(Math.min(maxTickets, quantity + 1))}
                disabled={quantity >= maxTickets}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r-lg disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-lg font-bold text-gray-800">
              {totalCost.toFixed(4)} ETH
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={handlePurchase}
              disabled={isLoading || !address}
              variant="primary"
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner className="mr-2" /> Processing...
                </span>
              ) : (
                `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        )}
        
        {!address && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-700 text-sm">
              Connect your wallet to purchase tickets
            </p>
          </div>
        )}
      </div>
    </div>
  );
}