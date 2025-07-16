// services/dashboardService.ts
import { DashboardData } from '@/types/dashboard';

export async function fetchUserDashboardData(address: string): Promise<DashboardData> {
  const response = await fetch(`/api/dashboard?address=${encodeURIComponent(address)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }
  
  return response.json();
}