import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="w-full space-y-6">
      {/* Generate 5 skeleton items */}
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 w-full">
              <div className="mt-1 w-6 h-6 bg-gray-200 rounded-full" />
              <div className="w-full">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2" />
                <div className="h-3 bg-gray-200 rounded w-1/5 mt-2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <div className="w-8 h-8 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SimpleLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
} 