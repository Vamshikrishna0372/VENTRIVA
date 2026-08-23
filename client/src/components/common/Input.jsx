import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  variant,
  size,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`
            w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl border transition-all duration-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : 'border-slate-800 hover:border-slate-700'}
            py-2.5 px-3.5
            ${className}
          `}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
