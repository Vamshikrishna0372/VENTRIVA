import React from 'react';

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse">
      <div className="h-5 bg-slate-800 rounded w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between py-2.5 border-b border-slate-800/60">
          <div className="w-1/3 h-4 bg-slate-800 rounded" />
          <div className="w-1/4 h-4 bg-slate-800/80 rounded" />
          <div className="w-16 h-4 bg-slate-800/60 rounded" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonTable;
