import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 border border-brand-400/30',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60',
  outline: 'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-600',
  ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-medium rounded-lg',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  isDisabled = false,
  icon: Icon,
  iconPosition,
  fullWidth,
  leftIcon,
  rightIcon,
  intent,
  isActive,
  active,
  showIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const isButtonLoading = isLoading || loading;

  return (
    <button
      type={type}
      disabled={isDisabled || isButtonLoading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-opacity-100 cursor-pointer
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isButtonLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon && iconPosition !== 'right' ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      {children}
      {!isButtonLoading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
    </button>
  );
};

export default Button;
