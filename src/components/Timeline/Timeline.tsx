import {
  defaultFormatGroupLabel,
  defaultGroupBy,
  formatItemTime,
} from './helpers';
import type { TimelineProps } from './Timeline.types';
import { useTimelineNavigation } from './useTimelineNavigation';
import { EmptyView } from './internals/EmptyView';

export function Timeline({
  items,
  groupBy = defaultGroupBy,
  formatGroupLabel = defaultFormatGroupLabel,
  onItemSelect,
  emptyMessage = 'No events',
}: TimelineProps) {
  const {
    groups,
    flat,
    starts,
    clampedActiveIndex,
    announcement,
    itemRefs,
    itemLabel,
    handleKeyDown,
    handleClick,
  } = useTimelineNavigation({ items, groupBy, formatGroupLabel, onItemSelect });

  if (flat.length === 0) {
    return <EmptyView message={emptyMessage} />;
  }

  return (
    <div className="space-y-6">
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>

      {groups.map((group, groupIdx) => (
        <section
          key={group.key}
          role="group"
          aria-label={formatGroupLabel(group.date)}
          className="space-y-2"
        >
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
                    aria-label={itemLabel(item)}
                    onClick={() => handleClick(currentIndex, item)}
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
