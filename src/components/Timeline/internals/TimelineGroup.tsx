import type { KeyboardEvent, MutableRefObject } from 'react';
import type { TimelineGroupData, TimelineItem } from '../Timeline.types';
import { TimelineItemRow } from './TimelineItemRow';

interface TimelineGroupProps {
  group: TimelineGroupData;
  groupStart: number;
  clampedActiveIndex: number;
  label: string;
  itemRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
  itemLabel: (item: TimelineItem) => string;
  onItemClick: (index: number, item: TimelineItem) => void;
  onItemKeyDown: (e: KeyboardEvent<HTMLButtonElement>, index: number) => void;
}

export function TimelineGroup({
  group,
  groupStart,
  clampedActiveIndex,
  label,
  itemRefs,
  itemLabel,
  onItemClick,
  onItemKeyDown,
}: TimelineGroupProps) {
  return (
    <section role="group" aria-label={label} className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">{label}</h3>
      <ul className="space-y-1">
        {group.items.map((item, itemIdx) => {
          const currentIndex = groupStart + itemIdx;
          return (
            <TimelineItemRow
              key={item.id}
              item={item}
              ariaLabel={itemLabel(item)}
              isActive={currentIndex === clampedActiveIndex}
              buttonRef={(el) => {
                itemRefs.current[currentIndex] = el;
              }}
              onClick={() => onItemClick(currentIndex, item)}
              onKeyDown={(e) => onItemKeyDown(e, currentIndex)}
            />
          );
        })}
      </ul>
    </section>
  );
}
