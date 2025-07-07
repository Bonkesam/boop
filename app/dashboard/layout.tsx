import { Providers } from '@/app/providers';
import { SideNavigation } from '@/components/dashboard/SideNavigation';
import { WalletStatusBar } from '@/components/dashboard/WalletStatusBar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <WalletStatusBar />
        <div className="flex">
          <SideNavigation />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}