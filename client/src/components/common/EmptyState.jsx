import React from 'react';
import { DatabaseBackup } from 'lucide-react';

const EmptyState = ({ title = 'No results found', message = 'There are no records matching your criteria.', icon }) => {
  return (
    <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
        {icon || <DatabaseBackup className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-500 max-w-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
