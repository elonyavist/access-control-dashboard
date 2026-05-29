import { useCallback, useState } from 'react';
import { accessEvents } from './accessEvents.data';
import type { AccessEvent } from './types';
import type { EventFormValues } from '@/components/EventForm';

let nextEventId = 0;

/** Owns the shared access-event store. New events are prepended; both views read `events`. */
export function useEvents() {
  const [events, setEvents] = useState<AccessEvent[]>(() => [...accessEvents]);

  const addEvent = useCallback((values: EventFormValues): AccessEvent => {
    const event: AccessEvent = {
      id: `evt-new-${nextEventId++}`,
      title: values.title,
      date: new Date(values.date),
      user: 'Admin',
      location: 'Main Entrance', // a real location so it matches the Location filter
      result: 'granted',
      method: 'manual',
    };
    setEvents((prev) => [event, ...prev]);
    return event;
  }, []);

  const updateEvent = useCallback((id: string, values: EventFormValues) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, title: values.title, date: new Date(values.date) } : e,
      ),
    );
  }, []);

  return { events, addEvent, updateEvent };
}
