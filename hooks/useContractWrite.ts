'use client';
import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { getWriteableContract, CONTRACT_ADDRESSES } from '@/lib/contracts';
import { ethers } from 'ethers';

export function useContractWrite(
  contractName: keyof typeof CONTRACT_ADDRESSES, 
  methodName: string
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();

  const write = async (args: any[] = [], overrides: ethers.Overrides = {}) => {
    if (!isConnected || !walletClient) {
      setError(new Error('Wallet not connected'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert walletClient to ethers signer
      const signer = walletClientToSigner(walletClient);
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

// Helper function to convert walletClient to ethers signer
function walletClientToSigner(walletClient: any) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.providers.Web3Provider(transport, network);
  return provider.getSigner(account.address);
}