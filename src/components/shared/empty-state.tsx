import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="surface flex flex-col items-start gap-2 px-6 py-10">
      <div className="text-[15px] font-semibold">{title}</div>
      <p className="muted max-w-lg">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="mt-2">
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
