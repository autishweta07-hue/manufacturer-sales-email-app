import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'destructive' | 'primary';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-subtle text-foreground',
  success: 'bg-[#e6f2eb] text-[#1c5d40]',
  warning: 'bg-[#f8eddc] text-[#7b5016]',
  destructive: 'bg-[#f8e8e6] text-[#8b332c]',
  primary: 'bg-[#eaf5cd] text-[#33450f]'
};

export function Badge({ className, tone = 'neutral', ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium leading-5',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('surface', className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-border px-5 py-4', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-5', className)} {...props} />;
}
