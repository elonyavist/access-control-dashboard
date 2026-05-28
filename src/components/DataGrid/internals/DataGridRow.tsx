import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ColumnDef } from '../DataGrid.types';
import { getCellValue } from '../helpers';

interface DataGridRowProps<T> {
  row: T;
  columns: ReadonlyArray<ColumnDef<T>>;
  onAction?: (row: T) => void;
  actionLabel: string;
  className?: string;
}

export function DataGridRow<T>({
  row,
  columns,
  onAction,
  actionLabel,
  className,
}: DataGridRowProps<T>) {
  return (
    <tr className={cn('border-b last:border-0 hover:bg-muted/30', className)}>
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
      {onAction && (
        <td className="px-4 py-3 text-right">
          <Button variant="outline" size="sm" onClick={() => onAction(row)}>
            {actionLabel}
          </Button>
        </td>
      )}
    </tr>
  );
}
