import { cn } from '@/lib/utils';

export function MetricCard({
  label,
  value,
  basis,
  hint,
  className
}: {
  label: string;
  value: string | number;
  basis?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn('surface px-5 py-4', className)} title={hint}>
      <div className="text-[12px] font-medium text-muted-foreground">{label}</div>
      <div className="tabular mt-2 text-[29px] font-semibold leading-none tracking-[-0.03em]">{value}</div>
      {basis && <div className="mt-2 text-[11px] text-muted-foreground">{basis}</div>}
    </div>
  );
}
