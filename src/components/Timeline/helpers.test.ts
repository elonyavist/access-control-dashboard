import { describe, expect, it } from 'vitest';
import type { TimelineItem } from './Timeline.types';
import {
  defaultGroupBy,
  flattenGroups,
  groupItems,
  groupStartIndices,
} from './helpers';

const items: TimelineItem[] = [
  { id: '1', date: new Date('2026-05-27T09:00'), title: 'Early 27' },
  { id: '2', date: new Date('2026-05-28T14:32'), title: 'Afternoon 28' },
  { id: '3', date: new Date('2026-05-28T08:00'), title: 'Morning 28' },
  { id: '4', date: new Date('2026-05-27T18:40'), title: 'Evening 27' },
];

describe('groupItems', () => {
  it('groups items by calendar day', () => {
    expect(groupItems(items, defaultGroupBy)).toHaveLength(2);
  });

  it('orders groups most-recent-day first', () => {
    const g = groupItems(items, defaultGroupBy);
    expect(g[0].items.every((i) => i.date.getDate() === 28)).toBe(true);
    expect(g[1].items.every((i) => i.date.getDate() === 27)).toBe(true);
  });

  it('orders items within a group most-recent-first', () => {
    const g = groupItems(items, defaultGroupBy);
    expect(g[0].items.map((i) => i.title)).toEqual(['Afternoon 28', 'Morning 28']);
    expect(g[1].items.map((i) => i.title)).toEqual(['Evening 27', 'Early 27']);
  });

  it('uses the most recent item date as the group representative date', () => {
    const g = groupItems(items, defaultGroupBy);
    expect(g[0].date.getHours()).toBe(14);
  });

  it('does not mutate the input', () => {
    const copy = [...items];
    groupItems(items, defaultGroupBy);
    expect(items).toEqual(copy);
  });

  it('returns empty array for no items', () => {
    expect(groupItems([], defaultGroupBy)).toEqual([]);
  });
});

describe('flattenGroups', () => {
  it('flattens in render order', () => {
    const g = groupItems(items, defaultGroupBy);
    expect(flattenGroups(g).map((i) => i.title)).toEqual([
      'Afternoon 28',
      'Morning 28',
      'Evening 27',
      'Early 27',
    ]);
  });
});

describe('groupStartIndices', () => {
  it('returns the flat start index of each group', () => {
    const g = groupItems(items, defaultGroupBy);
    expect(groupStartIndices(g)).toEqual([0, 2]);
  });
});
