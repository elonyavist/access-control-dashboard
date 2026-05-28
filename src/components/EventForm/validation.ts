import type { EventFormValues, EventFormErrors } from './EventForm.types';

export function validateTitle(title: string): string | undefined {
  if (title.trim().length === 0) return 'Title is required';
  return undefined;
}

export function validateDate(date: string): string | undefined {
  if (date.trim().length === 0) return 'Date is required';
  if (Number.isNaN(new Date(date).getTime())) return 'Enter a valid date';
  return undefined;
}

export function validateForm(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {};
  const title = validateTitle(values.title);
  const date = validateDate(values.date);
  if (title) errors.title = title;
  if (date) errors.date = date;
  return errors;
}

export const FIELD_ORDER: (keyof EventFormErrors)[] = ['title', 'date'];
