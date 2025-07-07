'use client';
import { useAccount, useDisconnect } from 'wagmi';
import { shortenAddress } from '@/utils/address';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

export function WalletStatusBar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div 
        className="font-bold text-lg cursor-pointer"
        onClick={() => router.push('/')}
      >
        dFortune
      </div>
      
      {isConnected && address && (
        <div className="flex items-center gap-4">
          <div className="bg-gray-700 px-3 py-1 rounded-full text-sm">
            {shortenAddress(address)}
          </div>
          <Button 
            onClick={() => {
              disconnect();
              router.push('/');
            }} 
            size="sm" 
            variant="outline"
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}