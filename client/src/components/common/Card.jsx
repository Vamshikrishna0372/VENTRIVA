import React from 'react';

export const Card = ({ children, className = '', hoverEffect = true, variant, active, glow, ...props }) => {
  return (
    <div
      className={`
        bg-slate-900/80 rounded-2xl border border-slate-800/80 p-5 shadow-lg relative overflow-hidden backdrop-blur-md
        ${hoverEffect ? 'hover:border-slate-700/80 transition-all duration-200 hover:shadow-card-glow' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between pb-4 border-b border-slate-800/60 mb-4 ${className}`}>
    <div>
      {title && <h3 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h3>}
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export default Card;
