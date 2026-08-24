'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { NavItem } from '@/components/layouts/sidebar-menu';

type BaseItem = Extract<NavItem, { title: string }>;

function isActivePath(href: string, pathname: string, exact?: boolean) {
  if (exact) {
    return pathname === href || pathname === href + '/';
  }

  return pathname === href || pathname.startsWith(href + '/');
}

function MenuItem({ item }: { item: BaseItem }) {
  const pathname = usePathname();

  const active = isActivePath(item.url, pathname, item.exact);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        render={<Link href={item.url} className="flex w-full items-center gap-2" />}
      >
        {item.icon && <item.icon className="size-4" />}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({ items }: { items: NavItem[] }) {
  const singleItems = items.filter((item) => 'title' in item);
  const groups = items.filter((item) => 'label' in item);

  return (
    <>
      {singleItems.length > 0 && (
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {singleItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
