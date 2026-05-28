import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ColumnDef, FilterValue, SortState } from '../DataGrid.types';
import { ColumnFilter } from './ColumnFilter';

interface DataGridHeaderProps<T> {
  columns: ReadonlyArray<ColumnDef<T>>;
  sort: SortState | null;
  filters: Record<string, FilterValue>;
  onSort: (columnId: string) => void;
  onFilter: (columnId: string, value: FilterValue) => void;
  hasActionsColumn: boolean;
}

export function DataGridHeader<T>({
  columns,
  sort,
  filters,
  onSort,
  onFilter,
  hasActionsColumn,
}: DataGridHeaderProps<T>) {
  const ariaSortFor = (
    id: string,
  ): 'ascending' | 'descending' | 'none' => {
    if (sort?.columnId !== id) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  };

  const showFilterRow = columns.some((c) => c.filterable);

  return (
    <thead>
      <tr className="border-b bg-muted/40">
        {columns.map((column) => (
          <th
            key={column.id}
            scope="col"
            aria-sort={column.sortable ? ariaSortFor(column.id) : undefined}
            className="px-4 py-3 font-medium text-muted-foreground"
            style={{ textAlign: column.align ?? 'left' }}
          >
            {column.sortable ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort(column.id)}
                className="h-auto gap-1 p-0 font-medium hover:bg-transparent hover:text-foreground"
              >
                {column.label}
                {sort?.columnId === column.id ? (
                  sort.direction === 'asc' ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )
                ) : (
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                )}
              </Button>
            ) : (
              column.label
            )}
          </th>
        ))}
        {hasActionsColumn && (
          <th scope="col" className="px-4 py-3">
            <span className="sr-only">Actions</span>
          </th>
        )}
      </tr>

      {showFilterRow && (
        <tr className="border-b">
          {columns.map((column) => (
            <th key={column.id} className="px-4 py-2">
              <div
                className={cn(
                  'flex',
                  column.align === 'right' ? 'justify-end' : 'justify-start',
                )}
              >
                <ColumnFilter
                  column={column}
                  value={filters[column.id]}
                  onChange={(value) => onFilter(column.id, value)}
                />
              </div>
            </th>
          ))}
          {hasActionsColumn && <th />}
        </tr>
      )}
    </thead>
  );
}
