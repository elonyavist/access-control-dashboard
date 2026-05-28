import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Inbox,
  SearchX,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { DataGridProps } from './DataGrid.types';
import { getCellValue } from './helpers';
import { useDataGrid } from './useDataGrid';
import { ColumnFilter } from './internals/ColumnFilter';
import { DataGridPagination } from './internals/DataGridPagination';
import { DataGridToolbar } from './internals/DataGridToolbar';
import { EmptyView } from './internals/EmptyView';
import { LoadingSkeleton } from './internals/LoadingSkeleton';

export function DataGrid<T>({
  data,
  columns,
  getRowId,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = 'No data available',
  noResultsMessage = 'No matching results',
  pageSize = 25,
  defaultSort,
  onRowAction,
  rowActionLabel = 'Open',
  rowClassName,
  caption,
  ariaLabel,
}: DataGridProps<T>) {
  const grid = useDataGrid({ data, columns, pageSize, defaultSort });

  const ariaSortFor = (
    columnId: string,
  ): 'ascending' | 'descending' | 'none' => {
    if (grid.sort?.columnId !== columnId) return 'none';
    return grid.sort.direction === 'asc' ? 'ascending' : 'descending';
  };

  const showFilterRow = grid.visibleColumns.some((c) => c.filterable);

  // 1. Error wins over everything
  if (error) {
    return (
      <div className="rounded-lg border">
        <EmptyView
          variant="error"
          icon={<TriangleAlert className="h-10 w-10 text-destructive" />}
          title={error}
          action={
            onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Retry
              </Button>
            )
          }
        />
      </div>
    );
  }

  // 2. Empty dataset (not caused by filters)
  if (!loading && data.length === 0 && !grid.hasActiveFilters) {
    return (
      <div className="rounded-lg border">
        <EmptyView icon={<Inbox className="h-10 w-10" />} title={emptyMessage} />
      </div>
    );
  }

  const isInitialLoad = loading && data.length === 0;

  return (
    <div className="w-full rounded-lg border">
      <DataGridToolbar
        columns={columns}
        hiddenColumnIds={grid.hiddenColumnIds}
        onToggleColumn={grid.toggleColumn}
      />

      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          aria-label={ariaLabel}
          aria-busy={loading}
        >
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b bg-muted/40">
              {grid.visibleColumns.map((column) => (
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
                      onClick={() => grid.toggleSort(column.id)}
                      className="h-auto gap-1 p-0 font-medium hover:bg-transparent hover:text-foreground"
                    >
                      {column.label}
                      <SortIcon
                        active={grid.sort?.columnId === column.id}
                        direction={grid.sort?.direction}
                      />
                    </Button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {onRowAction && (
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
            {showFilterRow && (
              <tr className="border-b">
                {grid.visibleColumns.map((column) => (
                  <th key={column.id} className="px-4 py-2">
                    <div
                      className={cn(
                        'flex',
                        column.align === 'right' ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <ColumnFilter
                        column={column}
                        value={grid.filters[column.id]}
                        onChange={(value) => grid.setFilter(column.id, value)}
                      />
                    </div>
                  </th>
                ))}
                {onRowAction && <th />}
              </tr>
            )}
          </thead>
          {isInitialLoad ? (
            <LoadingSkeleton columns={grid.visibleColumns} />
          ) : (
            <tbody>
              {grid.pageRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className={cn(
                    'border-b last:border-0 hover:bg-muted/30',
                    rowClassName?.(row),
                  )}
                >
                  {grid.visibleColumns.map((column) => (
                    <td
                      key={column.id}
                      className={cn('px-4 py-3', column.className)}
                      style={{ textAlign: column.align ?? 'left' }}
                    >
                      {column.cell
                        ? column.cell(row)
                        : String(getCellValue(row, column) ?? '')}
                    </td>
                  ))}
                  {onRowAction && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRowAction(row)}
                      >
                        {rowActionLabel}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {!loading && grid.totalFiltered === 0 && grid.hasActiveFilters && (
        <EmptyView
          icon={<SearchX className="h-10 w-10" />}
          title={noResultsMessage}
          action={
            <Button variant="outline" onClick={grid.clearFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {grid.totalFiltered > pageSize && (
        <DataGridPagination
          currentPage={grid.currentPage}
          totalPages={grid.totalPages}
          totalItems={grid.totalFiltered}
          pageSize={pageSize}
          onPageChange={grid.goToPage}
        />
      )}
    </div>
  );
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction?: 'asc' | 'desc';
}) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />;
  return direction === 'asc' ? (
    <ChevronUp className="h-3.5 w-3.5" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5" />
  );
}
