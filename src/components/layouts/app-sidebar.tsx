'use client';

import * as React from 'react';

import Link from 'next/link';
import Image from 'next/image';

import { NavMain } from '@/components/layouts/nav-main';
import { NavUser } from '@/components/layouts/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

import { menuData, RoleKey } from '@/components/layouts/sidebar-menu';

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  role: RoleKey;
  user: {
    name: string;
    username: string;
  };
};

export function AppSidebar({ role, user, ...props }: AppSidebarProps) {
  const menuItems = menuData[role] ?? [];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Link href="/" aria-label="Home" className="flex w-full items-center gap-3">
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center">
                  <Image
                    src="/logo-sekolah.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">SIM-Qur&apos;an</span>
                  <span className="truncate text-xs">SDIT Ulul Albab Mataram</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {role ? <NavMain items={menuItems} /> : <p className="px-4 py-2">Loading...</p>}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
