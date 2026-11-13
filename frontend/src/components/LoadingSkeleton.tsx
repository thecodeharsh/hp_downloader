import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4">
      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-lg p-5 md:p-6 animate-pulse">
        
        {/* Top Info Bar */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Thumbnail Skeleton */}
          <div className="w-full md:w-72 h-44 bg-gray-200 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer" />
            <div className="absolute bottom-2 right-2 w-12 h-5 bg-gray-300 rounded" />
          </div>

          {/* Details Skeleton */}
          <div className="flex-1 space-y-3">
            <div className="w-24 h-6 bg-gray-200 rounded-full" />
            <div className="w-full h-7 bg-gray-200 rounded-lg" />
            <div className="w-3/4 h-5 bg-gray-200 rounded-lg" />
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-32 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Format Table Skeleton */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="w-40 h-8 bg-gray-200 rounded-lg mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                  <div className="w-28 h-5 bg-gray-200 rounded" />
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded" />
                <div className="w-28 h-9 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
