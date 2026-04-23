import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Badge = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    unavailable: 'bg-red-50 text-red-700 border-red-200',
    outline: 'text-slate-700 border-slate-300',
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Badge.displayName = "Badge";

export { Badge };
