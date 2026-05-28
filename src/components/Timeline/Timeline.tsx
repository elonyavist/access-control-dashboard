import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  defaultFormatGroupLabel,
  defaultGroupBy,
  flattenGroups,
  formatItemTime,
  groupItems,
  groupStartIndices,
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
  const starts = useMemo(() => groupStartIndices(groups), [groups]);

  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Derive clamped active index in render (avoid setState-in-effect when items shrink).
  const clampedActiveIndex = Math.min(activeIndex, Math.max(0, flat.length - 1));

  const groupOfIndex = (index: number): number => {
    let g = 0;
    for (let i = 0; i < starts.length; i++) {
      if (index >= starts[i]) g = i;
      else break;
    }
    return g;
  };

  const focusIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, flat.length - 1));
    setActiveIndex(clamped);
    itemRefs.current[clamped]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusIndex(index + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusIndex(index - 1);
        break;
      case 'ArrowRight': {
        e.preventDefault();
        const next = starts[groupOfIndex(index) + 1];
        if (next !== undefined) focusIndex(next);
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const prev = starts[groupOfIndex(index) - 1];
        if (prev !== undefined) focusIndex(prev);
        break;
      }
      case 'Enter':
      case ' ':
        // Space would scroll the page otherwise
        e.preventDefault();
        onItemSelect?.(flat[index]);
        break;
    }
  };

  if (flat.length === 0) {
    return <EmptyView message={emptyMessage} />;
  }

  return (
    <div className="space-y-6">
      {groups.map((group, groupIdx) => (
        <section key={group.key} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {formatGroupLabel(group.date)}
          </h3>
          <ul className="space-y-1">
            {group.items.map((item, itemIdx) => {
              const currentIndex = starts[groupIdx] + itemIdx;
              return (
                <li key={item.id}>
                  <button
                    ref={(el) => {
                      itemRefs.current[currentIndex] = el;
                    }}
                    type="button"
                    tabIndex={currentIndex === clampedActiveIndex ? 0 : -1}
                    onClick={() => {
                      setActiveIndex(currentIndex);
                      onItemSelect?.(item);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, currentIndex)}
                    className="flex w-full gap-3 rounded-md border border-transparent px-3 py-2 text-left hover:border-border hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
