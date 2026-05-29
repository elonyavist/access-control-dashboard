import { format } from 'date-fns';
import type { TimelineItem } from '@/components/Timeline';
import type { AccessEvent } from './types';

/** Maps a domain event to the Timeline's fixed item shape. */
export function toTimelineItem(e: AccessEvent): TimelineItem {
  return {
    id: e.id,
    date: e.date,
    title: e.title,
    description: `${e.user} · ${e.result}`,
  };
}

/** Domain Date → the Form's datetime-local string ("yyyy-MM-ddTHH:mm"). */
export const toEventDateInput = (d: Date): string => format(d, "yyyy-MM-dd'T'HH:mm");
