import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const loaderCore = (
    <div className="flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loaderCore}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {loaderCore}
    </div>
  );
};

export default Loader;
