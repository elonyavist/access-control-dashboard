import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventForm } from '@/components/EventForm';
import type { EventFormValues } from '@/components/EventForm';
import type { AccessEvent } from '../events/types';
import { toEventDateInput } from '../events/mappers';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = add mode; an event = edit mode. */
  event: AccessEvent | null;
  onSave: (values: EventFormValues) => void;
}

export function EventDialog({ open, onOpenChange, event, onSave }: EventDialogProps) {
  const isEdit = event !== null;
  const initialValue = event
    ? { title: event.title, date: toEventDateInput(event.date) }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit event' : 'New event'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this access event.'
              : 'Add an access event to the log and timeline.'}
          </DialogDescription>
        </DialogHeader>
        <EventForm
          key={event?.id ?? 'new'} // remount per record so the Form resets between edits
          initialValue={initialValue}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
