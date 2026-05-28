import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  flattenGroups,
  formatItemTime,
  groupItems,
  groupStartIndices,
} from './helpers';
import type { TimelineItem } from './Timeline.types';

interface UseTimelineNavigationArgs {
  items: TimelineItem[];
  groupBy: (date: Date) => string;
  formatGroupLabel: (groupDate: Date) => string;
  onItemSelect?: (item: TimelineItem) => void;
}

export function useTimelineNavigation({
  items,
  groupBy,
  formatGroupLabel,
  onItemSelect,
}: UseTimelineNavigationArgs) {
  const groups = useMemo(() => groupItems(items, groupBy), [items, groupBy]);
  const flat = useMemo(() => flattenGroups(groups), [groups]);
  const starts = useMemo(() => groupStartIndices(groups), [groups]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prevGroupKeyRef = useRef<string | null>(null);

  const clampedActiveIndex = Math.min(activeIndex, Math.max(0, flat.length - 1));

  const groupOfIndex = (index: number): number => {
    let g = 0;
    for (let i = 0; i < starts.length; i++) {
      if (index >= starts[i]) g = i;
      else break;
    }
    return g;
  };

  const itemLabel = (item: TimelineItem): string =>
    `${formatItemTime(item.date)}, ${item.title}${item.description ? `, ${item.description}` : ''}`;

  const announce = (index: number) => {
    const item = flat[index];
    const groupData = groups[groupOfIndex(index)];
    if (prevGroupKeyRef.current !== groupData.key) {
      prevGroupKeyRef.current = groupData.key;
      setAnnouncement(`${formatGroupLabel(groupData.date)}, ${itemLabel(item)}`);
    } else {
      setAnnouncement(itemLabel(item));
    }
  };

  const focusIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, flat.length - 1));
    setActiveIndex(clamped);
    itemRefs.current[clamped]?.focus();
    announce(clamped);
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

  // Sync the announce baseline on click so a following keyboard move doesn't
  // falsely announce a group change.
  const handleClick = (index: number, item: TimelineItem) => {
    setActiveIndex(index);
    prevGroupKeyRef.current = groups[groupOfIndex(index)].key;
    onItemSelect?.(item);
  };

  return {
    groups,
    flat,
    starts,
    clampedActiveIndex,
    announcement,
    itemRefs,
    itemLabel,
    handleKeyDown,
    handleClick,
  };
}
