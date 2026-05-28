import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import { validateForm, FIELD_ORDER } from './validation';
import type { EventFormValues, EventFormErrors } from './EventForm.types';

const EMPTY: EventFormValues = { title: '', date: '' };

interface UseEventFormArgs {
  initialValue?: EventFormValues;
  onSave: (values: EventFormValues) => void;
}

export function useEventForm({ initialValue, onSave }: UseEventFormArgs) {
  const isEdit = initialValue !== undefined;
  const [values, setValues] = useState<EventFormValues>(initialValue ?? EMPTY);
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [saved, setSaved] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);

  const formId = useId();
  const ids = {
    title: `${formId}-title`,
    date: `${formId}-date`,
    titleError: `${formId}-title-error`,
    dateError: `${formId}-date-error`,
  };

  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const focusFirstInvalid = useEffectEvent(() => {
    const first = FIELD_ORDER.find((f) => errors[f]);
    if (!first) return;
    const ref = first === 'title' ? titleRef : dateRef;
    ref.current?.focus();
  });

  useEffect(() => {
    if (submitAttempt === 0) return;
    focusFirstInvalid();
  }, [submitAttempt]);

  const setField = (field: keyof EventFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setSubmitAttempt((n) => n + 1);

    if (Object.keys(nextErrors).length > 0) return;

    onSave({ ...values, title: values.title.trim() });
    setSaved(true);
    if (!isEdit) setValues(EMPTY);
  };

  return {
    isEdit,
    values,
    errors,
    saved,
    ids,
    titleRef,
    dateRef,
    setField,
    handleSubmit,
  };
}
