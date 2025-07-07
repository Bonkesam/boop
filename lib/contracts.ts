// lib/contracts/contracts.ts
import { ethers } from 'ethers';
import axios from 'axios';

// Contract addresses from your deployment logs
export const CONTRACT_ADDRESSES = {
  FORT: "0x54aAF35f979407Ea7dF7C4Fe4F10403D647494E2",
  TIMELOCK_CONTROLLER: "0x4D06ED028B87F528C09EF6BDE5109121D2C33404",
  TREASURY: "0x5Fc19bD5b73F19380a2c5471aE2Fa20DfBF8c200",
  TICKET_NFT: "0x0A19C1A8f6A9546f67C7a5a2952C6C0CC570B777",
  RANDOMNESS: "0xbed9670d6EaaED95e6A9D82E02A6182136DeaCb4",
  PRIZE_POOL: "0x7CA7E7E4D31670997aF63A8317430A98475C0E0e",
  LOTTERY_MANAGER: "0xFD6223c78E6cB083587746c1BaBDf54417033832",
  LOYALTY_TRACKER: "0xCf741893d85431Fb4563De4B03808AcD9a750C62",
  DAO_GOVERNOR: "0xC5AC9b7cbA6AB2f6090FF15dD16b16E278907F73"
};

// Etherscan API configuration
const ETHERSCAN_API_URL = "https://api-sepolia.etherscan.io/api";
const API_KEY = process.env.ETHERSCAN_API_KEY;

// Cache for storing ABIs to reduce API calls
const abiCache: Record<string, any> = {};

/**
 * Fetches ABI from Etherscan API with caching
 * @param contractAddress - Address of the contract
 * @returns Contract ABI
 */
export const fetchABI = async (contractAddress: string): Promise<any[]> => {
  // Return cached ABI if available
  if (abiCache[contractAddress]) {
    return abiCache[contractAddress];
  }

  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: "contract",
        action: "getabi",
        address: contractAddress,
        apikey: API_KEY
      }
    });

    if (response.data.status !== "1" || !response.data.result) {
      throw new Error(`Etherscan error: ${response.data.message}`);
    }

    const abi = JSON.parse(response.data.result);
    
    // Cache the ABI
    abiCache[contractAddress] = abi;
    
    return abi;
  } catch (error) {
    console.error(`Failed to fetch ABI for ${contractAddress}:`, error);
    throw error;
  }
};

/**
 * Creates a read-only contract instance
 * @param contractName - Name of the contract (key from CONTRACT_ADDRESSES)
 * @param provider - Ethers provider
 * @returns Contract instance
 */
export const getReadOnlyContract = async (
  contractName: keyof typeof CONTRACT_ADDRESSES,
  provider: ethers.Provider
): Promise<ethers.Contract> => {
  const address = CONTRACT_ADDRESSES[contractName];
  const abi = await fetchABI(address);
  return new ethers.Contract(address, abi, provider);
};

/**
 * Creates a writeable contract instance with signer
 * @param contractName - Name of the contract (key from CONTRACT_ADDRESSES)
 * @param signer - Ethers signer
 * @returns Contract instance
 */
export const getWriteableContract = async (
  contractName: keyof typeof CONTRACT_ADDRESSES,
  signer: ethers.Signer
): Promise<ethers.Contract> => {
  const address = CONTRACT_ADDRESSES[contractName];
  const abi = await fetchABI(address);
  return new ethers.Contract(address, abi, signer);
};

/**
 * Creates contract instances for all core contracts
 * @param providerOrSigner - Ethers provider or signer
 * @returns Object with all contract instances
 */
export const getAllContracts = async (
  providerOrSigner: ethers.Provider | ethers.Signer
) => {
  const contracts: Record<string, ethers.Contract> = {};
  
  for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
    const abi = await fetchABI(address);
    contracts[name] = new ethers.Contract(address, abi, providerOrSigner);
  }
  
  return contracts as Record<keyof typeof CONTRACT_ADDRESSES, ethers.Contract>;
};

// Utility function to get contract address by name
export const getContractAddress = (
  contractName: keyof typeof CONTRACT_ADDRESSES
) => CONTRACT_ADDRESSES[contractName];

// Type exports for TypeScript support
export type LotteryManager = ethers.Contract;
export type TicketNFT = ethers.Contract;
export type PrizePool = ethers.Contract;
export type FORT = ethers.Contract;
export type Randomness = ethers.Contract;
export type LoyaltyTracker = ethers.Contract;
export type DAOGovernor = ethers.Contract;
export type Treasury = ethers.Contract;