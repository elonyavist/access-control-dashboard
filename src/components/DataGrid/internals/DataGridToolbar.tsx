import { Columns3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ColumnDef } from '../DataGrid.types';

interface DataGridToolbarProps<T> {
  columns: ReadonlyArray<ColumnDef<T>>;
  hiddenColumnIds: ReadonlySet<string>;
  onToggleColumn: (columnId: string) => void;
}

export function DataGridToolbar<T>({
  columns,
  hiddenColumnIds,
  onToggleColumn,
}: DataGridToolbarProps<T>) {
  return (
    <div className="flex justify-end p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Columns3 className="h-4 w-4" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={!hiddenColumnIds.has(column.id)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => onToggleColumn(column.id)}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
