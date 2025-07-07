import { cn } from '@/utils/cn';

export function LoadingSkeleton() {
  return (
    <div className={cn("max-w-7xl mx-auto space-y-6 animate-pulse")}>
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Lottery Card Skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Ticket Purchase Skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          
          {/* Claim Prizes Skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-20 bg-gray-50 rounded-lg"></div>
              <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          {/* Loyalty Status Skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* My Tickets Skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}