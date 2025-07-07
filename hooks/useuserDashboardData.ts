import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { fetchUserDashboardData } from '@/services/dashboardService';
import { DashboardData } from '@/types/dashboard';

export function useUserDashboardData() {
  const { address } = useAccount();
  
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    address ? ['dashboard-data', address] : null,
    ([_, addr]) => fetchUserDashboardData(addr),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    isLoading,
    error,
    refresh: mutate,
  };
}