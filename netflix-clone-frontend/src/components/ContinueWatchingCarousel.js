import React from "react";

const ContinueWatchingCarousel = () => {
  // This would typically come from your backend/localStorage
  const continueWatching = []; // Add your continue watching data here

  if (continueWatching.length === 0) {
    return null; // Don't show if no data
  }

  return (
    <div className="px-8 py-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Continue Watching</h2>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
        {/* Add your continue watching cards here */}
      </div>
    </div>
  );
};

export default ContinueWatchingCarousel;