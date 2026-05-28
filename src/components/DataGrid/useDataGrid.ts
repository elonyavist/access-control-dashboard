import { useDeferredValue, useMemo, useState } from 'react';
import type { ColumnDef, FilterValue, SortState } from './DataGrid.types';
import { filterRows, isFilterActive, paginate, sortRows } from './helpers';

interface UseDataGridParams<T> {
  data: ReadonlyArray<T>;
  columns: ReadonlyArray<ColumnDef<T>>;
  pageSize: number;
  defaultSort?: SortState;
}

interface UseDataGridResult<T> {
  pageRows: T[];
  totalFiltered: number;
  totalPages: number;
  currentPage: number;
  visibleColumns: ReadonlyArray<ColumnDef<T>>;
  hasActiveFilters: boolean;
  sort: SortState | null;
  filters: Record<string, FilterValue>;
  hiddenColumnIds: ReadonlySet<string>;
  toggleSort: (columnId: string) => void;
  setFilter: (columnId: string, value: FilterValue) => void;
  clearFilters: () => void;
  goToPage: (page: number) => void;
  toggleColumn: (columnId: string) => void;
}

export function useDataGrid<T>({
  data,
  columns,
  pageSize,
  defaultSort,
}: UseDataGridParams<T>): UseDataGridResult<T> {
  const [sort, setSort] = useState<SortState | null>(defaultSort ?? null);
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)),
  );

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumnIds.has(c.id)),
    [columns, hiddenColumnIds],
  );

  // Defer filtering so heavy typing stays responsive on large datasets
  const deferredFilters = useDeferredValue(filters);

  const filteredData = useMemo(
    () => filterRows(data, columns, deferredFilters),
    [data, columns, deferredFilters],
  );

  const sortedData = useMemo(
    () => sortRows(filteredData, columns, sort),
    [filteredData, columns, sort],
  );

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);

  const pageRows = useMemo(
    () => paginate(sortedData, clampedPage, pageSize),
    [sortedData, clampedPage, pageSize],
  );

  // Based on live filters (not deferred) so the empty-state UI doesn't lag
  const hasActiveFilters = Object.values(filters).some(isFilterActive);

  const toggleSort = (columnId: string) => {
    setSort((prev) => {
      if (prev?.columnId !== columnId) return { columnId, direction: 'asc' };
      if (prev.direction === 'asc') return { columnId, direction: 'desc' };
      return null;
    });
    setCurrentPage(1);
  };

  const setFilter = (columnId: string, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Clamp at call time for consistency (also re-clamped on render)
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const toggleColumn = (columnId: string) => {
    setHiddenColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  };

  return {
    pageRows,
    totalFiltered: sortedData.length,
    totalPages,
    currentPage: clampedPage,
    visibleColumns,
    hasActiveFilters,
    sort,
    filters,
    hiddenColumnIds,
    toggleSort,
    setFilter,
    clearFilters,
    goToPage,
    toggleColumn,
  };
}
