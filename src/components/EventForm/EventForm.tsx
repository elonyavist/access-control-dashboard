import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateForm, FIELD_ORDER } from './validation';
import type {
  EventFormProps,
  EventFormValues,
  EventFormErrors,
} from './EventForm.types';

const EMPTY: EventFormValues = { title: '', date: '' };

export function EventForm({ initialValue, onSave, onCancel }: EventFormProps) {
  const isEdit = initialValue !== undefined;
  const [values, setValues] = useState<EventFormValues>(initialValue ?? EMPTY);
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [saved, setSaved] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);

  const formId = useId();
  const titleId = `${formId}-title`;
  const dateId = `${formId}-date`;
  const titleErrorId = `${titleId}-error`;
  const dateErrorId = `${dateId}-error`;

  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  // Runs after commit, so the focused field already carries its aria-describedby
  // link when the screen reader lands on it.
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

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={titleId}>Title</Label>
        <Input
          id={titleId}
          ref={titleRef}
          value={values.title}
          onChange={(e) => setField('title', e.target.value)}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? titleErrorId : undefined}
        />
        {errors.title && (
          <p id={titleErrorId} className="text-sm text-destructive">
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={dateId}>Date &amp; time</Label>
        <Input
          id={dateId}
          type="datetime-local"
          ref={dateRef}
          value={values.date}
          onChange={(e) => setField('date', e.target.value)}
          aria-invalid={errors.date ? true : undefined}
          aria-describedby={errors.date ? dateErrorId : undefined}
        />
        {errors.date && (
          <p id={dateErrorId} className="text-sm text-destructive">
            {errors.date}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {saved && (
          <p role="status" className="text-sm text-green-600">
            Event saved
          </p>
        )}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? 'Save' : 'Create'}</Button>
        </div>
      </div>
    </form>
  );
}