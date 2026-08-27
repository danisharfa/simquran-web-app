'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { flexRender, Table as TanStackTable } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Button } from './button';
import { DataTablePagination } from './table-pagination';

interface Props<T> {
  title?: string;
  table: TanStackTable<T>;
  filterColumn?: string;
  showColumnFilter?: boolean;
  showPagination?: boolean;
  toolbar?: ReactNode;
}

export function DataTable<T>({
  title,
  table,
  filterColumn,
  showColumnFilter = true,
  showPagination = true,
  toolbar,
}: Props<T>) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <h2 className="text-xl font-semibold">{title}</h2>
        </CardHeader>
      )}
      <CardContent className="min-w-0">
        <div className="flex flex-wrap items-end gap-2 py-4">
          {toolbar}
          {filterColumn && table.getColumn(filterColumn) && (
            <Field className="w-56">
              <FieldLabel aria-hidden="true">&nbsp;</FieldLabel>
              <Input
                placeholder={`Cari ${filterColumn}...`}
                aria-label={`Cari ${filterColumn}`}
                onChange={(event) =>
                  table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                }
              />
            </Field>
          )}
          {showColumnFilter && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="ml-auto">
                    Kolom <ChevronDown />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(
                    (column) => typeof column.accessorFn !== 'undefined' && column.getCanHide(),
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="text-center">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {showPagination && <DataTablePagination table={table} />}
      </CardContent>
    </Card>
  );
}
