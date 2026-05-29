import { useState } from 'react';
import { Timeline } from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import type { EventFormValues } from '@/components/EventForm';
import { EventDialog } from './EventDialog';
import { DataGridStatesDemo } from './DataGridStatesDemo';
import { accessEventColumns } from './columns';
import { useEvents } from '../events/useEvents';
import { toTimelineItem } from '../events/mappers';
import type { AccessEvent } from '../events/types';
import { useAnnouncer } from '@/hooks/useAnnouncer';

// Timeline shows the front slice of the store. New events are prepended, so an added
// event is always in the slice (and thus in the timeline) regardless of its date.
const TIMELINE_SIZE = 40;

export function Dashboard() {
  const { events, addEvent, updateEvent } = useEvents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AccessEvent | null>(null);
  const { message: announcement, announce } = useAnnouncer();

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (event: AccessEvent) => {
    setEditing(event);
    setDialogOpen(true);
  };

  const handleSave = (values: EventFormValues) => {
    if (editing) {
      updateEvent(editing.id, values);
      announce(`Event "${values.title}" updated.`);
    } else {
      addEvent(values);
      announce(`Event "${values.title}" added to the log and timeline.`);
    }
    // useAnnouncer defers the message so it lands after the dialog closes (see the hook).
    setDialogOpen(false);
    setEditing(null);
  };

  const timelineItems = events.slice(0, TIMELINE_SIZE).map(toTimelineItem);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 p-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Access Control Dashboard
            </h1>
            <p className="mt-1 text-slate-600">{events.length} access events</p>
          </div>
          <Button onClick={openAdd}>+ New Event</Button>
        </header>

        {/* App-level announcement region: mounted empty up-front, survives dialog close. */}
        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* min-w-0 lets the flex child shrink so the grid's overflow-x-auto works */}
          <section
            aria-labelledby="access-log-heading"
            className="space-y-3 lg:min-w-0 lg:flex-1"
          >
            <h2 id="access-log-heading" className="text-lg font-semibold text-slate-800">
              Access log
            </h2>
            {/* Demo wrapper around <DataGrid>; swap back to <DataGrid> to drop the demo. */}
            <DataGridStatesDemo
              data={events}
              columns={accessEventColumns}
              getRowId={(e) => e.id}
              defaultSort={{ columnId: 'date', direction: 'desc' }}
              onRowAction={openEdit}
              rowActionLabel="Edit"
              caption="Access events log"
            />
          </section>

          <section
            aria-labelledby="recent-activity-heading"
            className="space-y-3 lg:sticky lg:top-8 lg:w-80 lg:shrink-0"
          >
            <h2
              id="recent-activity-heading"
              className="text-lg font-semibold text-slate-800"
            >
              Recent activity
            </h2>
            {/* Card frame to match the grid + capped height so the rail scrolls
                internally instead of towering below the table. */}
            <div className="rounded-lg border p-4 lg:max-h-[500px] lg:overflow-y-auto">
              <Timeline
                items={timelineItems}
                onItemSelect={(item) => {
                  const found = events.find((e) => e.id === item.id);
                  if (found) openEdit(found);
                }}
              />
            </div>
          </section>
        </div>

        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          event={editing}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
