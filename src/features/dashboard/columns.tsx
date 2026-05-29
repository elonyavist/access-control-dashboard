import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@/components/DataGrid';
import { LOCATIONS, METHODS, type AccessEvent } from '../events/types';

export const accessEventColumns: ColumnDef<AccessEvent>[] = [
  { id: 'title', label: 'Event', accessor: 'title', filterable: true, filterType: 'text' },
  { id: 'user', label: 'User', accessor: 'user', filterable: true, filterType: 'text' },
  {
    id: 'location',
    label: 'Location',
    accessor: 'location',
    filterable: true,
    filterType: 'select',
    filterOptions: LOCATIONS.map((l) => ({ value: l, label: l })),
  },
  {
    id: 'result',
    label: 'Result',
    accessor: 'result',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'granted', label: 'Granted' },
      { value: 'denied', label: 'Denied' },
    ],
    cell: (row) => (
      <Badge variant={row.result === 'granted' ? 'secondary' : 'destructive'}>
        {row.result}
      </Badge>
    ),
  },
  {
    id: 'method',
    label: 'Method',
    accessor: 'method',
    filterable: true,
    filterType: 'select',
    filterOptions: METHODS.map((m) => ({ value: m, label: m })),
    defaultHidden: true, // showcases the hide/show toggle out of the box
  },
  {
    id: 'date',
    label: 'Time',
    accessor: 'date',
    sortable: true,
    align: 'right',
    cell: (row) => format(row.date, 'd MMM yyyy, HH:mm'),
  },
];
