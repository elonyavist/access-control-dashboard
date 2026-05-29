import { useState } from 'react';
import { DataGrid } from '@/components/DataGrid';
import type { DataGridProps } from '@/components/DataGrid';
import { Button } from '@/components/ui/button';

// DEMO-ONLY drop-in wrapper around <DataGrid>: adds buttons to preview the grid's
// loading / empty / error states. To ship without it, replace <DataGridStatesDemo … />
// with <DataGrid … /> (identical props) and delete this file. Nothing else changes.

const STATES = ['normal', 'loading', 'empty', 'error'] as const;
type DemoState = (typeof STATES)[number];

export function DataGridStatesDemo<T>(props: DataGridProps<T>) {
  const [state, setState] = useState<DemoState>('normal');

  const overrides: Record<DemoState, Partial<DataGridProps<T>>> = {
    normal: {},
    loading: { data: [], loading: true },
    empty: { data: [] },
    error: {
      data: [],
      error: 'Failed to load access events.',
      onRetry: () => setState('normal'),
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-3">
        <span className="text-xs font-medium text-slate-500">Demo — grid states:</span>
        {STATES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={s === state ? 'default' : 'outline'}
            aria-pressed={s === state}
            onClick={() => setState(s)}
          >
            {s}
          </Button>
        ))}
      </div>
      <DataGrid {...props} {...overrides[state]} />
    </div>
  );
}
