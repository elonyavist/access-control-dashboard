import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventForm } from '@/components/EventForm';
import type { EventFormValues } from '@/components/EventForm';
import type { AccessEvent } from './types';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = add mode; an event = edit mode. */
  event: AccessEvent | null;
  onSave: (values: EventFormValues) => void;
}

// The Form's `date` is the datetime-local string format; the domain uses Date.
const toInput = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm");

export function EventDialog({ open, onOpenChange, event, onSave }: EventDialogProps) {
  const isEdit = event !== null;
  const initialValue = event
    ? { title: event.title, date: toInput(event.date) }
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
