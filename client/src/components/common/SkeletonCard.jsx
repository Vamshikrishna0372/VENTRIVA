import React from 'react';

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse ${className}`}>
      <div className="flex items-center justify-between">
        <div className="w-1/3 h-4 bg-slate-800 rounded" />
        <div className="w-16 h-4 bg-slate-800 rounded-full" />
      </div>
      <div className="w-2/3 h-6 bg-slate-800 rounded" />
      <div className="space-y-2">
        <div className="w-full h-3 bg-slate-800/80 rounded" />
        <div className="w-4/5 h-3 bg-slate-800/80 rounded" />
      </div>
      <div className="pt-3 border-t border-slate-800 flex justify-end">
        <div className="w-24 h-8 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
};

export default SkeletonCard;
