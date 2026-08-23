import React from 'react';

export const Select = ({
  label,
  options = [],
  error,
  icon: Icon,
  className = '',
  id,
  variant,
  size,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          id={selectId}
          className={`
            w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 appearance-none
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${error ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'}
            py-2.5 pr-8
            ${className}
          `}
          {...props}
        >
          {options && options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                  {opt.label}
                </option>
              ))
            : props.children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
