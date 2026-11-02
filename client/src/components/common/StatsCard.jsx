import React from 'react';

const StatsCard = ({ title, value, subtitle, icon, trendDirection, trendValue, color = 'primary' }) => {
  const colorStyles = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const activeColor = colorStyles[color] || colorStyles.primary;

  return (
    <div className="glass-card p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeColor}`}>
          {icon}
        </div>
        {trendValue && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trendDirection === 'up' ? 'bg-emerald-100 text-emerald-700' : 
            trendDirection === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
          }`}>
            {trendDirection === 'up' && '+'}
            {trendDirection === 'down' && '-'}
            {trendValue}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
