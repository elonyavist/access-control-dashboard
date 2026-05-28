import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { DataGridProps } from './DataGrid.types';
import { getCellValue } from './helpers';

export function DataGrid<T>({
  data,
  columns,
  getRowId,
  onRowAction,
  rowActionLabel = 'Open',
  rowClassName,
  caption,
  ariaLabel,
}: DataGridProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm" aria-label={ariaLabel}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b bg-muted/40">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className="px-4 py-3 font-medium text-muted-foreground"
                style={{ textAlign: column.align ?? 'left' }}
              >
                {column.label}
              </th>
            ))}
            {onRowAction && (
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
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
  );
}
