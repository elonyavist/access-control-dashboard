import { Inbox, SearchX, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DataGridProps } from './DataGrid.types';
import { useDataGrid } from './useDataGrid';
import { DataGridHeader } from './internals/DataGridHeader';
import { DataGridPagination } from './internals/DataGridPagination';
import { DataGridRow } from './internals/DataGridRow';
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
          className="w-full border-collapse text-sm table-fixed"
          aria-label={ariaLabel}
          aria-busy={loading}
        >
          {caption && <caption className="sr-only">{caption}</caption>}

          <DataGridHeader
            columns={grid.visibleColumns}
            sort={grid.sort}
            filters={grid.filters}
            onSort={grid.toggleSort}
            onFilter={grid.setFilter}
            hasActionsColumn={!!onRowAction}
          />

          {isInitialLoad ? (
            <LoadingSkeleton columns={grid.visibleColumns} />
          ) : (
            <tbody>
              {grid.pageRows.map((row) => (
                <DataGridRow
                  key={getRowId(row)}
                  row={row}
                  columns={grid.visibleColumns}
                  onAction={onRowAction}
                  actionLabel={rowActionLabel}
                  className={rowClassName?.(row)}
                />
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
