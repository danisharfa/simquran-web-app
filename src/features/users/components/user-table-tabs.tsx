'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserTable } from './user-table';
import { UserTableData } from '../queries/list-users';

interface UserTableTab {
  value: string;
  label: string;
  data: UserTableData[];
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
            {tab.label} ({tab.data.length})
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <UserTable data={tab.data} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
