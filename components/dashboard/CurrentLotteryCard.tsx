import { formatDistance } from 'date-fns';
import { DrawStatusBadge } from './DrawStatusBadge';

interface CurrentLotteryCardProps {
  draw: {
    id: string;
    endTime: Date;
    status: string;
    prizePool: string;
  };
  ticketPrice: string;
}

export function CurrentLotteryCard({ draw, ticketPrice }: CurrentLotteryCardProps) {
  if (!draw) return null;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Current Lottery</h2>
            <div className="mt-1 flex items-center gap-2">
              <DrawStatusBadge status={draw.status} />
              <span className="text-sm text-gray-500">
                Draw #{draw.id}
              </span>
            </div>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            {parseFloat(ticketPrice).toFixed(4)} ETH
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Prize Pool</p>
            <p className="text-xl font-bold text-gray-800">
              {parseFloat(draw.prizePool).toFixed(2)} ETH
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Time Remaining</p>
            <p className="text-xl font-bold text-gray-800">
              {draw.status === 'COMPLETED' 
                ? 'Completed' 
                : formatDistance(new Date(), draw.endTime, { addSuffix: true })}
            </p>
          </div>
        </div>

        {draw.status === 'SALE_OPEN' && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">
              Tickets are now available for purchase! The draw ends in{' '}
              {formatDistance(new Date(), draw.endTime)}.
            </p>
          </div>
        )}

        {draw.status === 'DRAWING' && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700 text-sm">
              Draw in progress. Winners will be announced shortly.
            </p>
          </div>
        )}

        {draw.status === 'COMPLETED' && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm">
              Draw completed! Check if you won and claim your prize.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 