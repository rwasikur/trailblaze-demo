import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Card = React.forwardRef(({ className, animateHover = false, ...props }, ref) => {
  const CardComponent = animateHover ? motion.div : 'div';
  const animationProps = animateHover
    ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
      }
    : {};

  return (
    <CardComponent
      ref={ref}
      className={cn(
        "rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm overflow-hidden",
        animateHover && "hover:shadow-lg transition-shadow duration-300",
        className
      )}
      {...animationProps}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-lg", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardImage = React.forwardRef(({ className, src, alt, ...props }, ref) => (
  <div className={cn("aspect-[16/9] w-full overflow-hidden bg-slate-100", className)}>
    <img
      ref={ref}
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
      {...props}
    />
  </div>
));
CardImage.displayName = "CardImage";

export { Card, CardHeader, CardTitle, CardContent, CardImage };
