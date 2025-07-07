import Link from 'next/link';
import { TicketIcon } from '@heroicons/react/24/outline';
import { DrawStatusBadge } from './DrawStatusBadge';

interface MyTicketsProps {
  tickets?: Array<{
    id: string;
    tokenId: number;
    isGolden: boolean;
    isSilver: boolean;
    mintedAt: Date;
    lottery: {
      drawId: number;
      status: string;
    };
  }>;
}

export function MyTickets({ tickets = [] }: MyTicketsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">My Tickets</h2>
          <Link href="/dashboard/tickets" className="text-sm text-indigo-600 hover:text-indigo-800">
            View All
          </Link>
        </div>
        
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <TicketIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No tickets yet</p>
            <p className="text-xs text-gray-400 mt-1">Purchase tickets to join the lottery</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="py-3 flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Ticket #{ticket.tokenId}
                  </p>
                  <div className="mt-1 flex items-center">
                    <DrawStatusBadge status={ticket.lottery.status} />
                    <span className="text-xs text-gray-500 ml-2">
                      Draw #{ticket.lottery.drawId}
                    </span>
                  </div>
                  <div className="mt-1 flex">
                    {ticket.isGolden && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Golden
                      </span>
                    )}
                    {ticket.isSilver && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-1">
                        Silver
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}