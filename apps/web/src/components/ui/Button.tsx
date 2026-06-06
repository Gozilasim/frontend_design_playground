import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'text-primary-foreground hover:bg-primary/90 h-10 bg-primary px-4 py-2':
              variant === 'default' && size === 'default',
            'text-destructive-foreground hover:bg-destructive/90 h-10 bg-destructive px-4 py-2':
              variant === 'destructive' && size === 'default',
            'border-input hover:text-accent-foreground h-10 border bg-background px-4 py-2 hover:bg-accent':
              variant === 'outline' && size === 'default',
            'text-secondary-foreground hover:bg-secondary/80 h-10 bg-secondary px-4 py-2':
              variant === 'secondary' && size === 'default',
            'hover:text-accent-foreground h-10 px-4 py-2 hover:bg-accent':
              variant === 'ghost' && size === 'default',
            'h-10 px-4 py-2 text-primary underline-offset-4 hover:underline':
              variant === 'link' && size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          }
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
