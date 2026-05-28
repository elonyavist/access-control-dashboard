import { describe, it, expect } from 'vitest';
import { validateTitle, validateDate, validateForm } from './validation';

describe('validateTitle', () => {
  it('rejects empty / whitespace', () => {
    expect(validateTitle('')).toBeDefined();
    expect(validateTitle('   ')).toBeDefined();
  });
  it('accepts non-empty', () => {
    expect(validateTitle('Hello')).toBeUndefined();
  });
});

describe('validateDate', () => {
  it('rejects empty', () => {
    expect(validateDate('')).toBeDefined();
  });
  it('rejects garbage', () => {
    expect(validateDate('not-a-date')).toBeDefined();
  });
  it('accepts a valid datetime-local value', () => {
    expect(validateDate('2026-05-28T14:32')).toBeUndefined();
  });
});

describe('validateForm', () => {
  it('returns errors for both empty fields', () => {
    const e = validateForm({ title: '', date: '' });
    expect(e.title).toBeDefined();
    expect(e.date).toBeDefined();
  });
  it('returns empty object when valid', () => {
    expect(validateForm({ title: 'Ok', date: '2026-05-28T14:32' })).toEqual({});
  });
});
