'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  TicketIcon, 
  BanknotesIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useDisconnect } from 'wagmi';
import { shortenAddress } from '@/utils/address';
import { useAccount } from 'wagmi';

export function SideNavigation() {
  const pathname = usePathname();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'My Tickets', href: '/dashboard/tickets', icon: TicketIcon },
    { name: 'Prizes', href: '/dashboard/prizes', icon: BanknotesIcon },
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
  ];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
      <div className="mb-8 p-4">
        <h1 className="text-xl font-bold text-gray-800">dFortune</h1>
        {address && (
          <p className="text-xs text-gray-500 mt-1">
            {shortenAddress(address)}
          </p>
        )}
      </div>
      
      <ul className="space-y-1 flex-1">
        {navigation.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg ${
                pathname === item.href
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => disconnect()}
        className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 mt-auto"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
        <span>Disconnect</span>
      </button>
    </nav>
  );
}