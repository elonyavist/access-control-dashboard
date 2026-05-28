import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEventForm } from './useEventForm';
import type { EventFormProps } from './EventForm.types';

export function EventForm({ initialValue, onSave, onCancel }: EventFormProps) {
  const {
    isEdit,
    values,
    errors,
    saved,
    ids,
    titleRef,
    dateRef,
    setField,
    handleSubmit,
  } = useEventForm({ initialValue, onSave });

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={ids.title}>Title</Label>
        <Input
          id={ids.title}
          ref={titleRef}
          value={values.title}
          onChange={(e) => setField('title', e.target.value)}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? ids.titleError : undefined}
        />
        {errors.title && (
          <p id={ids.titleError} className="text-sm text-destructive">
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.date}>Date &amp; time</Label>
        <Input
          id={ids.date}
          type="datetime-local"
          ref={dateRef}
          value={values.date}
          onChange={(e) => setField('date', e.target.value)}
          aria-invalid={errors.date ? true : undefined}
          aria-describedby={errors.date ? ids.dateError : undefined}
        />
        {errors.date && (
          <p id={ids.dateError} className="text-sm text-destructive">
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
