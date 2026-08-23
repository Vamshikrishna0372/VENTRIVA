import React from 'react';

const badgeVariants = {
  brand: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  slate: 'bg-slate-800 text-slate-300 border-slate-700',
  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
};

export const Badge = ({ children, variant = 'brand', size = 'sm', className = '' }) => {
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border tracking-wide uppercase font-mono
        ${badgeVariants[variant] || badgeVariants.brand}
        ${sizeClasses}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
