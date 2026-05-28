import type { ColumnDef, FilterValue, SortState } from './DataGrid.types';

export function getCellValue<T>(row: T, column: ColumnDef<T>): unknown {
  return typeof column.accessor === 'function'
    ? column.accessor(row)
    : row[column.accessor];
}

function buildColumnMap<T>(
  columns: ReadonlyArray<ColumnDef<T>>,
): Map<string, ColumnDef<T>> {
  return new Map(columns.map((c) => [c.id, c]));
}

function compare(a: unknown, b: unknown): number {
  // null / undefined always sort last
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b));
}

export function sortRows<T>(
  rows: ReadonlyArray<T>,
  columns: ReadonlyArray<ColumnDef<T>>,
  sort: SortState | null,
): T[] {
  if (!sort) return [...rows];

  const column = columns.find((c) => c.id === sort.columnId);
  if (!column) return [...rows];

  // Flip the comparator for descending — stable, no reverse()
  const direction = sort.direction === 'asc' ? 1 : -1;

  return [...rows].sort(
    (a, b) => direction * compare(getCellValue(a, column), getCellValue(b, column)),
  );
}

function matchesFilter(value: unknown, filter: FilterValue): boolean {
  if (filter.type === 'text') {
    if (!filter.value) return true;
    return String(value ?? '')
      .toLowerCase()
      .includes(filter.value.toLowerCase());
  }
  // select
  if (filter.values.length === 0) return true;
  return filter.values.includes(String(value));
}

export function filterRows<T>(
  rows: ReadonlyArray<T>,
  columns: ReadonlyArray<ColumnDef<T>>,
  filters: Record<string, FilterValue>,
): T[] {
  const active = Object.entries(filters);
  if (active.length === 0) return [...rows];

  // Build the column lookup once, not per row
  const columnMap = buildColumnMap(columns);

  return rows.filter((row) =>
    active.every(([columnId, filterValue]) => {
      const column = columnMap.get(columnId);
      if (!column) return true;
      return matchesFilter(getCellValue(row, column), filterValue);
    }),
  );
}

export function paginate<T>(
  rows: ReadonlyArray<T>,
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function isFilterActive(filter: FilterValue): boolean {
  return (
    (filter.type === 'text' && filter.value !== '') ||
    (filter.type === 'select' && filter.values.length > 0)
  );
}
