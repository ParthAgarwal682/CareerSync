import React from 'react';

const Badge = ({ children, status, customText }) => {
  const label = customText ?? children ?? status ?? '';

  const getColors = () => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'selected':
      case 'placed':
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
      case 'inactive':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
      case 'applied':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'shortlisted':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'oa_pending':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'interviewing':
      case 'in-round':
      case 'in_round':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getColors()}`}>
      {label}
    </span>
  );
};

export default Badge;
