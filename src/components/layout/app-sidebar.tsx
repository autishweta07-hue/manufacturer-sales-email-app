'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  FileSpreadsheet,
  LayoutDashboard,
  Mail,
  Send,
  Users,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/leads', label: 'Upload leads', icon: FileSpreadsheet },
  { href: '/recipients', label: 'Recipients', icon: Users },
  { href: '/compose', label: 'Compose', icon: Mail },
  { href: '/preview', label: 'Preview & test', icon: Send },
  { href: '/campaigns', label: 'Campaigns', icon: BarChart3 }
];

function SignalMark() {
  return (
    <span className="flex h-7 w-7 items-end justify-center gap-[3px] rounded-[7px] bg-primary pb-[6px]" aria-hidden="true">
      <span className="h-2 w-[3px] rounded-sm bg-primary-foreground" />
      <span className="h-3 w-[3px] rounded-sm bg-primary-foreground" />
      <span className="h-[18px] w-[3px] rounded-sm bg-primary-foreground" />
    </span>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-border bg-[#f1f2ec] lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <SignalMark />
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-[-0.02em]">Signalry</div>
          <div className="text-[11px] text-muted-foreground">Sales outreach</div>
        </div>
      </div>
      <nav className="mt-3 flex flex-1 flex-col gap-1 px-3" aria-label="Primary navigation">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex h-10 items-center gap-3 rounded-[8px] px-3 text-[13px] font-medium transition-colors',
                active ? 'bg-surface text-foreground' : 'text-muted-foreground hover:bg-surface/70 hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active && <span className="absolute left-0 top-2 h-6 w-[3px] rounded-r bg-primary" />}
              <Icon size={17} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border px-5 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Workspace</div>
        <div className="mt-1 text-[13px] font-medium">Sales team</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">Internal use only</div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 lg:hidden" aria-label="Primary navigation">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-[12px] font-medium',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
