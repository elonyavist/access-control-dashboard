import type { ColumnDef } from '../DataGrid.types';

// Cycled widths to give the skeleton an organic, non-uniform look
const SKELETON_WIDTHS = ['70%', '50%', '85%', '60%'];

interface LoadingSkeletonProps<T> {
  columns: ReadonlyArray<ColumnDef<T>>;
  rows?: number;
}

export function LoadingSkeleton<T>({
  columns,
  rows = 8,
}: LoadingSkeletonProps<T>) {
  return (
    <tbody aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b last:border-0">
          {columns.map((column, c) => (
            <td key={column.id} className="px-4 py-3">
              <div
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: SKELETON_WIDTHS[(r + c) % SKELETON_WIDTHS.length] }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
