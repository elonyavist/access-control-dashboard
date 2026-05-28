import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ColumnDef, FilterValue } from '../DataGrid.types';

interface ColumnFilterProps<T> {
  column: ColumnDef<T>;
  value: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}

// Sentinel for the "All" option — Radix Select can't use an empty-string value
const ALL = '__all__';

export function ColumnFilter<T>({
  column,
  value,
  onChange,
}: ColumnFilterProps<T>) {
  if (!column.filterable) return null;

  if (column.filterType === 'select') {
    const selected = value?.type === 'select' ? value.values[0] ?? ALL : ALL;
    return (
      <Select
        value={selected}
        onValueChange={(v) =>
          onChange({ type: 'select', values: v === ALL ? [] : [v] })
        }
      >
        <SelectTrigger
          size="sm"
          className="w-full max-w-[250px]"
          aria-label={`Filter by ${column.label}`}
        >
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {column.filterOptions?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const text = value?.type === 'text' ? value.value : '';
  return (
    <Input
      type="text"
      aria-label={`Filter by ${column.label}`}
      placeholder={`Filter ${column.label.toLowerCase()}`}
      className="h-8 max-w-[250px] text-xs"
      value={text}
      onChange={(e) => onChange({ type: 'text', value: e.target.value })}
    />
  );
}
