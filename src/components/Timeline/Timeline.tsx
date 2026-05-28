import { useMemo } from 'react';
import {
  defaultFormatGroupLabel,
  defaultGroupBy,
  flattenGroups,
  formatItemTime,
  groupItems,
} from './helpers';
import type { TimelineProps } from './Timeline.types';
import { EmptyView } from './internals/EmptyView';

export function Timeline({
  items,
  groupBy = defaultGroupBy,
  formatGroupLabel = defaultFormatGroupLabel,
  onItemSelect,
  emptyMessage = 'No events',
}: TimelineProps) {
  const groups = useMemo(() => groupItems(items, groupBy), [items, groupBy]);
  const flat = useMemo(() => flattenGroups(groups), [groups]);

  if (flat.length === 0) {
    return <EmptyView message={emptyMessage} />;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {formatGroupLabel(group.date)}
          </h3>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onItemSelect?.(item)}
                  className="flex w-full gap-3 rounded-md border border-transparent px-3 py-2 text-left hover:border-border hover:bg-muted/50"
                >
                  <span className="shrink-0 font-mono text-sm text-muted-foreground">
                    {formatItemTime(item.date)}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.description && (
                      <span className="text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
