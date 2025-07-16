import { Providers } from '@/app/providers';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}