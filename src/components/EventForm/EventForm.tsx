import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EventFormProps, EventFormValues } from './EventForm.types';

const EMPTY: EventFormValues = { title: '', date: '' };

export function EventForm({ initialValue, onSave, onCancel }: EventFormProps) {
  const isEdit = initialValue !== undefined;
  const [values, setValues] = useState<EventFormValues>(initialValue ?? EMPTY);

  const formId = useId();
  const titleId = `${formId}-title`;
  const dateId = `${formId}-date`;

  const setField = (field: keyof EventFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={titleId}>Title</Label>
        <Input
          id={titleId}
          value={values.title}
          onChange={(e) => setField('title', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={dateId}>Date &amp; time</Label>
        <Input
          id={dateId}
          type="datetime-local"
          value={values.date}
          onChange={(e) => setField('date', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(values)}>
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </div>
    </div>
  );
}
