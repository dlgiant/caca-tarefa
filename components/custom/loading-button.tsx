'use client';
import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}
export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(({ className, children, loading, loadingText, disabled, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText || children : children}
    </Button>
  );
});
LoadingButton.displayName = 'LoadingButton';
