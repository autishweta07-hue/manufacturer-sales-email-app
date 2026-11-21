import type { ReactNode } from 'react';
import { AppSidebar, MobileNav } from './app-sidebar';
import { cn } from '@/lib/utils';

export function AppShell({ children, title, description, actions }: { children: ReactNode; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-6 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold">Sales outreach</span>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <span className="hidden text-[13px] text-muted-foreground sm:inline">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-md bg-surface-subtle px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Internal tool · Recorded data
            </span>
            {actions}
          </div>
        </header>
        <MobileNav />
        <main className={cn('page-container')}>
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="eyebrow mb-1.5">Manufacturer outreach</div>
              <h1>{title}</h1>
              {description && <p className="muted mt-1.5 max-w-2xl">{description}</p>}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
