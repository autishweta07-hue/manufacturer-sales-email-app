import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'default' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:brightness-95 font-semibold',
  secondary: 'bg-secondary text-secondary-foreground hover:brightness-95 font-medium',
  outline: 'border border-border bg-surface text-foreground hover:bg-surface-subtle font-medium',
  ghost: 'text-foreground hover:bg-surface-subtle font-medium',
  destructive: 'bg-destructive text-destructive-foreground hover:brightness-95 font-medium'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12px]',
  default: 'h-9 px-4 text-[13px]',
  lg: 'h-10 px-5 text-[13px]'
};

export function Button({
  className,
  variant = 'outline',
  size = 'default',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[9px] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
