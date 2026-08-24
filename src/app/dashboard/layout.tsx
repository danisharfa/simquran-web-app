import { requireSession } from '@/lib/require-role';

import type { RoleKey } from '@/components/layouts/sidebar-menu';
import { AppSidebar } from '@/components/layouts/app-sidebar';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = session.user.role.toLowerCase() as RoleKey;

  return (
    <SidebarProvider>
      <AppSidebar
        role={role}
        user={{
          name: session.user.name,
          username: session.user.username ?? '',
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex flex-1 flex-col p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
