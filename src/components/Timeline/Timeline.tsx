import { defaultFormatGroupLabel, defaultGroupBy } from './helpers';
import type { TimelineProps } from './Timeline.types';
import { useTimelineNavigation } from './useTimelineNavigation';
import { EmptyView } from './internals/EmptyView';
import { TimelineGroup } from './internals/TimelineGroup';

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
        <TimelineGroup
          key={group.key}
          group={group}
          groupStart={starts[groupIdx]}
          clampedActiveIndex={clampedActiveIndex}
          label={formatGroupLabel(group.date)}
          itemRefs={itemRefs}
          itemLabel={itemLabel}
          onItemClick={handleClick}
          onItemKeyDown={handleKeyDown}
        />
      ))}
    </div>
  );
}
