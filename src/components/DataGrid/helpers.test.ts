import { describe, it, expect } from 'vitest';
import { sortRows, filterRows, paginate, isFilterActive } from './helpers';
import type { ColumnDef } from './DataGrid.types';

interface Row {
  id: string;
  name: string;
  age: number;
  joined: Date | null;
}

const columns: ColumnDef<Row>[] = [
  { id: 'name', label: 'Name', accessor: 'name' },
  { id: 'age', label: 'Age', accessor: 'age' },
  { id: 'joined', label: 'Joined', accessor: 'joined' },
];

const rows: Row[] = [
  { id: '1', name: 'Charlie', age: 30, joined: new Date('2022-01-01') },
  { id: '2', name: 'alice', age: 25, joined: new Date('2020-06-15') },
  { id: '3', name: 'Bob', age: 35, joined: null },
];

// ---- sortRows ------------------------------------------------------

describe('sortRows', () => {
  it('returns a copy when sort is null (does not mutate input)', () => {
    const result = sortRows(rows, columns, null);
    expect(result).not.toBe(rows);
    expect(result).toEqual(rows);
  });

  it('sorts strings ascending, case-insensitively', () => {
    const result = sortRows(rows, columns, { columnId: 'name', direction: 'asc' });
    expect(result.map((r) => r.name)).toEqual(['alice', 'Bob', 'Charlie']);
  });

  it('sorts strings descending', () => {
    const result = sortRows(rows, columns, { columnId: 'name', direction: 'desc' });
    expect(result.map((r) => r.name)).toEqual(['Charlie', 'Bob', 'alice']);
  });

  it('sorts numbers numerically, not lexicographically', () => {
    const result = sortRows(rows, columns, { columnId: 'age', direction: 'asc' });
    expect(result.map((r) => r.age)).toEqual([25, 30, 35]);
  });

  it('sorts numbers descending', () => {
    const result = sortRows(rows, columns, { columnId: 'age', direction: 'desc' });
    expect(result.map((r) => r.age)).toEqual([35, 30, 25]);
  });

  it('sorts Date values chronologically', () => {
    const result = sortRows(rows, columns, { columnId: 'joined', direction: 'asc' });
    expect(result.map((r) => r.name)).toEqual(['alice', 'Charlie', 'Bob']);
  });

  it('returns a copy when the sorted column is not found', () => {
    const result = sortRows(rows, columns, { columnId: 'nonexistent', direction: 'asc' });
    expect(result).toEqual(rows);
  });

  it('does not mutate the original array', () => {
    const original = [...rows];
    sortRows(rows, columns, { columnId: 'age', direction: 'asc' });
    expect(rows).toEqual(original);
  });
});

// ---- filterRows ----------------------------------------------------

describe('filterRows', () => {
  it('returns all rows when no filters are active', () => {
    const result = filterRows(rows, columns, {});
    expect(result).toHaveLength(3);
  });

  it('filters by case-insensitive text substring', () => {
    const result = filterRows(rows, columns, {
      name: { type: 'text', value: 'a' },
    });
    expect(result.map((r) => r.name).sort()).toEqual(['Charlie', 'alice']);
  });

  it('returns all rows when the text filter is empty', () => {
    const result = filterRows(rows, columns, {
      name: { type: 'text', value: '' },
    });
    expect(result).toHaveLength(3);
  });

  it('filters by select values', () => {
    const result = filterRows(rows, columns, {
      name: { type: 'select', values: ['Bob'] },
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('returns all rows when the select filter has no values', () => {
    const result = filterRows(rows, columns, {
      name: { type: 'select', values: [] },
    });
    expect(result).toHaveLength(3);
  });

  it('combines multiple filters with AND', () => {
    const result = filterRows(rows, columns, {
      name: { type: 'text', value: 'b' },
      age: { type: 'text', value: '35' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('ignores filters for unknown columns', () => {
    const result = filterRows(rows, columns, {
      nonexistent: { type: 'text', value: 'x' },
    });
    expect(result).toHaveLength(3);
  });

  it('does not mutate the original array', () => {
    const original = [...rows];
    filterRows(rows, columns, { name: { type: 'text', value: 'a' } });
    expect(rows).toEqual(original);
  });
});

// ---- paginate ------------------------------------------------------

describe('paginate', () => {
  const many = Array.from({ length: 25 }, (_, i) => ({ id: String(i) }));

  it('returns the first page', () => {
    const result = paginate(many, 1, 10);
    expect(result).toHaveLength(10);
    expect(result[0].id).toBe('0');
    expect(result[9].id).toBe('9');
  });

  it('returns the second page', () => {
    const result = paginate(many, 2, 10);
    expect(result).toHaveLength(10);
    expect(result[0].id).toBe('10');
  });

  it('returns a partial last page', () => {
    const result = paginate(many, 3, 10);
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe('20');
    expect(result[4].id).toBe('24');
  });

  it('returns empty for a page beyond the data', () => {
    const result = paginate(many, 10, 10);
    expect(result).toHaveLength(0);
  });

  it('handles a page size larger than the dataset', () => {
    const result = paginate(many, 1, 100);
    expect(result).toHaveLength(25);
  });
});

// ---- isFilterActive ------------------------------------------------

describe('isFilterActive', () => {
  it('is false for an empty text filter', () => {
    expect(isFilterActive({ type: 'text', value: '' })).toBe(false);
  });

  it('is true for a non-empty text filter', () => {
    expect(isFilterActive({ type: 'text', value: 'x' })).toBe(true);
  });

  it('is false for a select filter with no values', () => {
    expect(isFilterActive({ type: 'select', values: [] })).toBe(false);
  });

  it('is true for a select filter with values', () => {
    expect(isFilterActive({ type: 'select', values: ['a'] })).toBe(true);
  });
});