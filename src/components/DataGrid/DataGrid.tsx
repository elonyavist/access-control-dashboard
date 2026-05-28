import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { DataGridProps, FilterValue, SortState } from './DataGrid.types';
import { filterRows, getCellValue, paginate, sortRows } from './helpers';
import { ColumnFilter } from './internals/ColumnFilter';
import { DataGridPagination } from './internals/DataGridPagination';

export function DataGrid<T>({
  data,
  columns,
  getRowId,
  pageSize,
  defaultSort,
  onRowAction,
  rowActionLabel = 'Open',
  rowClassName,
  caption,
  ariaLabel,
}: DataGridProps<T>) {
  const [sort, setSort] = useState<SortState | null>(defaultSort ?? null);
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const effectivePageSize = pageSize ?? 25;

  const filteredData = useMemo(
    () => filterRows(data, columns, filters),
    [data, columns, filters],
  );

  const sortedData = useMemo(
    () => sortRows(filteredData, columns, sort),
    [filteredData, columns, sort],
  );

  const totalPages = Math.max(1, Math.ceil(sortedData.length / effectivePageSize));
  const clampedPage = Math.min(currentPage, totalPages);

  const pageRows = useMemo(
    () => paginate(sortedData, clampedPage, effectivePageSize),
    [sortedData, clampedPage, effectivePageSize],
  );

  const handleSort = (columnId: string) => {
    setSort((prev) => {
      if (prev?.columnId !== columnId) return { columnId, direction: 'asc' };
      if (prev.direction === 'asc') return { columnId, direction: 'desc' };
      return null;
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (columnId: string, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }));
    setCurrentPage(1);
  };

  const ariaSortFor = (
    columnId: string,
  ): 'ascending' | 'descending' | 'none' => {
    if (sort?.columnId !== columnId) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  };

  const showFilterRow = columns.some((c) => c.filterable);

  return (
    <div className="w-full rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" aria-label={ariaLabel}>
          {caption && <caption className="sr-only">{caption}</caption>}
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
                      onClick={() => handleSort(column.id)}
                      className="h-auto gap-1 p-0 font-medium hover:bg-transparent hover:text-foreground"
                    >
                      {column.label}
                      <SortIcon
                        active={sort?.columnId === column.id}
                        direction={sort?.direction}
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
                {columns.map((column) => (
                  <th key={column.id} className="px-4 py-2">
                    <ColumnFilter
                      column={column}
                      value={filters[column.id]}
                      onChange={(value) => handleFilterChange(column.id, value)}
                    />
                  </th>
                ))}
                {onRowAction && <th />}
              </tr>
            )}
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={getRowId(row)}
                className={cn(
                  'border-b last:border-0 hover:bg-muted/30',
                  rowClassName?.(row),
                )}
              >
                {columns.map((column) => (
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
        </table>
      </div>

      {sortedData.length > effectivePageSize && (
        <DataGridPagination
          currentPage={clampedPage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          pageSize={effectivePageSize}
          onPageChange={setCurrentPage}
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
