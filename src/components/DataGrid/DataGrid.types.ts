import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export type FilterValue =
  | { type: 'text'; value: string }
  | { type: 'select'; values: string[] };

export interface ColumnDef<T> {
  /** Stable identifier — used for React keys, sort state, filter state, visibility. */
  id: string;
  /** Display label in the column header. */
  label: string;
  /** How to read the cell value: a property key or a function. */
  accessor: keyof T | ((row: T) => unknown);
  /** Enables the header as a sort toggle. */
  sortable?: boolean;
  /** Enables a filter control for this column. */
  filterable?: boolean;
  /** Filter control type (defaults to 'text'). */
  filterType?: 'text' | 'select';
  /** Options for select filters. */
  filterOptions?: ReadonlyArray<{ value: string; label: string }>;
  /** Hidden initially; the user can toggle it on. */
  defaultHidden?: boolean;
  /** Custom cell renderer. Falls back to String(value). */
  cell?: (row: T) => ReactNode;
  /** Optional class applied to cells in this column. */
  className?: string;
  /** Text alignment for this column. */
  align?: 'left' | 'right' | 'center';
}

export interface DataGridProps<T> {
  // Required
  data: ReadonlyArray<T>;
  columns: ReadonlyArray<ColumnDef<T>>;
  getRowId: (row: T) => string;

  // Async state
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  // State messages (sensible defaults if omitted)
  emptyMessage?: string;
  noResultsMessage?: string;

  // Configuration
  pageSize?: number;
  defaultSort?: SortState;

  // Interactions
  onRowAction?: (row: T) => void;
  rowActionLabel?: string;
  rowClassName?: (row: T) => string | undefined;

  // Accessibility
  caption?: string;
  ariaLabel?: string;
}
