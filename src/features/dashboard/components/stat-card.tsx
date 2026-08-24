import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ComponentType, SVGProps } from 'react';

interface Props {
  label: string;
  value: number | string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function StatCard({ label, value, icon: Icon }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
