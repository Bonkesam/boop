'use client';
import { useState } from 'react';
import { useAccount, useSigner } from 'wagmi';
import { getWriteableContract } from '@/lib/contracts';
import { ethers } from 'ethers';

export function useContractWrite(contractName: string, methodName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { data: signer } = useSigner();
  const { isConnected } = useAccount();

  const write = async (args: any[] = [], overrides: ethers.Overrides = {}) => {
    if (!isConnected || !signer) {
      setError(new Error('Wallet not connected'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getWriteableContract(contractName, signer);
      const tx = await contract[methodName](...args, overrides);
      const receipt = await tx.wait();
      return receipt;
    } catch (err: any) {
      console.error(`Contract call failed: ${contractName}.${methodName}`, err);
      
      let reason = 'Transaction failed';
      if (err.data?.message) {
        reason = err.data.message;
      } else if (err.reason) {
        reason = err.reason;
      } else if (err.error?.message) {
        reason = err.error.message;
      }
      
      const error = new Error(`Contract error: ${reason}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    write,
    isLoading,
    error,
  };
}