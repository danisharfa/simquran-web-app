'use client';

import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserTable } from './user-table';
import { UserTableData } from '../queries/list-users';

interface UserTableTab {
  value: string;
  label: string;
  data: UserTableData[];
  /** Render konten kustom (mis. tabel dengan kolom/aksi berbeda) alih-alih UserTable default. */
  content?: ReactNode;
  /** Override jumlah di label tab, untuk tab dengan `content` kustom (data bukan UserTableData[]). */
  count?: number;
  /** Tampilkan kolom Status, Tanggal Lulus, dan Tanggal Keluar (khusus tabel siswa). */
  showStudentColumns?: boolean;
}

interface Props {
  tabs: UserTableTab[];
}

export function UserTableTabs({ tabs }: Props) {
  return (
    <Tabs defaultValue={tabs[0]?.value}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label} ({tab.count ?? tab.data.length})
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content ?? (
            <UserTable data={tab.data} showStudentColumns={tab.showStudentColumns} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
