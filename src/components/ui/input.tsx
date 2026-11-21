import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.ComponentPropsWithRef<'input'>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-[9px] border border-input bg-surface px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus-visible:ring-2',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentPropsWithRef<'textarea'>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-[9px] border border-input bg-surface px-3 py-2.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:ring-2',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.ComponentPropsWithRef<'select'>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-[9px] border border-input bg-surface px-3 text-[14px] text-foreground focus-visible:ring-2',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1.5 block text-[12px] font-medium text-foreground', className)} {...props} />;
}
