import { compareDesc, format, startOfDay } from 'date-fns';
import type { TimelineGroupData, TimelineItem } from './Timeline.types';

/** Default group key: the start of the calendar day, as an ISO string. */
export function defaultGroupBy(date: Date): string {
  return startOfDay(date).toISOString();
}

/** Default group label: the representative date formatted as a localized day. */
export function defaultFormatGroupLabel(groupDate: Date): string {
  return format(groupDate, 'd MMMM yyyy');
}

/** Formats an item's time for display within a group. */
export function formatItemTime(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * Groups items by the key function and returns groups ordered most-recent-first,
 * with items inside each group also ordered most-recent-first. Sorting is explicit
 * so the result is deterministic regardless of input order.
 */
export function groupItems(
  items: ReadonlyArray<TimelineItem>,
  groupBy: (date: Date) => string,
): TimelineGroupData[] {
  const map = new Map<string, TimelineItem[]>();

  for (const item of items) {
    const key = groupBy(item.date);
    const bucket = map.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  const groups: TimelineGroupData[] = [];
  for (const [key, bucket] of map) {
    const sorted = [...bucket].sort((a, b) => compareDesc(a.date, b.date));
    groups.push({
      key,
      date: sorted[0].date,
      items: sorted,
    });
  }

  groups.sort((a, b) => compareDesc(a.date, b.date));
  return groups;
}

/** Flattens groups into a single list in render order. Used by keyboard nav. */
export function flattenGroups(
  groups: ReadonlyArray<TimelineGroupData>,
): TimelineItem[] {
  return groups.flatMap((g) => g.items);
}

/** Flat index of each group's first item. Used by Left/Right to jump groups. */
export function groupStartIndices(
  groups: ReadonlyArray<TimelineGroupData>,
): number[] {
  const starts: number[] = [];
  let running = 0;
  for (const group of groups) {
    starts.push(running);
    running += group.items.length;
  }
  return starts;
}
