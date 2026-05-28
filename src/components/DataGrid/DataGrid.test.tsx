import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DataGrid } from './DataGrid';
import type { ColumnDef } from './DataGrid.types';

// ---- Test fixtures -------------------------------------------------

interface Row {
  id: string;
  name: string;
  age: number;
  city: string;
}

function makeRows(n: number): Row[] {
  const cities = ['Rome', 'Milan', 'Turin'];
  return Array.from({ length: n }, (_, i) => ({
    id: String(i),
    name: `Person ${i}`,
    age: 20 + i,
    city: cities[i % cities.length],
  }));
}

const columns: ColumnDef<Row>[] = [
  { id: 'name', label: 'Name', accessor: 'name', sortable: true, filterable: true },
  { id: 'age', label: 'Age', accessor: 'age', sortable: true, align: 'right' },
  {
    id: 'city',
    label: 'City',
    accessor: 'city',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'Rome', label: 'Rome' },
      { value: 'Milan', label: 'Milan' },
      { value: 'Turin', label: 'Turin' },
    ],
  },
];

// Helper: get the data rows from the table body (excludes header + filter rows)
function getBodyRows(): HTMLElement[] {
  // tbody rows only; header lives in thead
  const rowgroups = screen.getAllByRole('rowgroup');
  const tbody = rowgroups[rowgroups.length - 1];
  return within(tbody).queryAllByRole('row');
}

// ---- Rendering -----------------------------------------------------

describe('DataGrid — rendering', () => {
  it('renders all rows when data fits on one page', () => {
    render(
      <DataGrid data={makeRows(3)} columns={columns} getRowId={(r) => r.id} />,
    );
    expect(screen.getByText('Person 0')).toBeInTheDocument();
    expect(screen.getByText('Person 1')).toBeInTheDocument();
    expect(screen.getByText('Person 2')).toBeInTheDocument();
  });

  it('renders column headers from the column config', () => {
    render(
      <DataGrid data={makeRows(3)} columns={columns} getRowId={(r) => r.id} />,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('uses a custom cell renderer when provided', () => {
    const cols: ColumnDef<Row>[] = [
      { id: 'name', label: 'Name', accessor: 'name' },
      { id: 'city', label: 'City', accessor: 'city', cell: (r) => `City: ${r.city}` },
    ];
    render(<DataGrid data={makeRows(1)} columns={cols} getRowId={(r) => r.id} />);
    expect(screen.getByText('City: Rome')).toBeInTheDocument();
  });
});

// ---- Sorting -------------------------------------------------------

describe('DataGrid — sorting', () => {
  it('sorts ascending, then descending, then clears on a third click', async () => {
    const user = userEvent.setup();
    // names out of order so we can observe sorting
    const data: Row[] = [
      { id: '1', name: 'Charlie', age: 30, city: 'Rome' },
      { id: '2', name: 'Alice', age: 25, city: 'Milan' },
      { id: '3', name: 'Bob', age: 35, city: 'Turin' },
    ];
    render(<DataGrid data={data} columns={columns} getRowId={(r) => r.id} />);

    const nameHeader = screen.getByRole('button', { name: /name/i });

    // 1st click — ascending
    await user.click(nameHeader);
    let rows = getBodyRows();
    expect(within(rows[0]).getByText('Alice')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Charlie')).toBeInTheDocument();

    // 2nd click — descending
    await user.click(nameHeader);
    rows = getBodyRows();
    expect(within(rows[0]).getByText('Charlie')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Alice')).toBeInTheDocument();

    // 3rd click — cleared, back to insertion order
    await user.click(nameHeader);
    rows = getBodyRows();
    expect(within(rows[0]).getByText('Charlie')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Alice')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Bob')).toBeInTheDocument();
  });

  it('exposes aria-sort on the active sortable column', async () => {
    const user = userEvent.setup();
    render(<DataGrid data={makeRows(3)} columns={columns} getRowId={(r) => r.id} />);

    const nameColHeader = screen.getByRole('columnheader', { name: /name/i });
    expect(nameColHeader).toHaveAttribute('aria-sort', 'none');

    await user.click(screen.getByRole('button', { name: /name/i }));
    expect(nameColHeader).toHaveAttribute('aria-sort', 'ascending');
  });
});

// ---- Filtering -----------------------------------------------------

describe('DataGrid — filtering', () => {
  it('filters rows by a case-insensitive text match', async () => {
    const user = userEvent.setup();
    const data: Row[] = [
      { id: '1', name: 'Alice', age: 25, city: 'Rome' },
      { id: '2', name: 'Bob', age: 30, city: 'Milan' },
      { id: '3', name: 'Carol', age: 35, city: 'Turin' },
    ];
    render(<DataGrid data={data} columns={columns} getRowId={(r) => r.id} />);

    const nameFilter = screen.getByLabelText(/filter by name/i);
    await user.type(nameFilter, 'a'); // matches Alice + Carol (case-insensitive)

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('shows the no-results state when a filter matches nothing', async () => {
    const user = userEvent.setup();
    render(
      <DataGrid
        data={makeRows(5)}
        columns={columns}
        getRowId={(r) => r.id}
        noResultsMessage="No matching results"
      />,
    );

    const nameFilter = screen.getByLabelText(/filter by name/i);
    await user.type(nameFilter, 'fake name');

    expect(screen.getByText('No matching results')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('restores rows when filters are cleared', async () => {
    const user = userEvent.setup();
    render(<DataGrid data={makeRows(5)} columns={columns} getRowId={(r) => r.id} />);

    const nameFilter = screen.getByLabelText(/filter by name/i);
    await user.type(nameFilter, 'zzzzz');
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByText('Person 0')).toBeInTheDocument();
  });
});

// ---- Pagination ----------------------------------------------------

describe('DataGrid — pagination', () => {
  it('splits rows into pages of pageSize', () => {
    render(
      <DataGrid
        data={makeRows(25)}
        columns={columns}
        getRowId={(r) => r.id}
        pageSize={10}
      />,
    );
    expect(screen.getByText('Person 0')).toBeInTheDocument();
    expect(screen.getByText('Person 9')).toBeInTheDocument();
    expect(screen.queryByText('Person 10')).not.toBeInTheDocument();
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
  });

  it('navigates to the next page', async () => {
    const user = userEvent.setup();
    render(
      <DataGrid
        data={makeRows(25)}
        columns={columns}
        getRowId={(r) => r.id}
        pageSize={10}
      />,
    );
    await user.click(screen.getByRole('button', { name: /next page/i }));
    expect(screen.getByText('Person 10')).toBeInTheDocument();
    expect(screen.queryByText('Person 0')).not.toBeInTheDocument();
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();
  });

  it('disables previous on the first page', () => {
    render(
      <DataGrid
        data={makeRows(25)}
        columns={columns}
        getRowId={(r) => r.id}
        pageSize={10}
      />,
    );
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  it('resets to page 1 when a filter is applied', async () => {
    const user = userEvent.setup();
    render(
      <DataGrid
        data={makeRows(25)}
        columns={columns}
        getRowId={(r) => r.id}
        pageSize={10}
      />,
    );
    await user.click(screen.getByRole('button', { name: /next page/i }));
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/filter by name/i), 'Person 1');
    expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
  });
});

// ---- States --------------------------------------------------------

describe('DataGrid — states', () => {
  it('shows the empty state for an empty dataset', () => {
    render(
      <DataGrid
        data={[]}
        columns={columns}
        getRowId={(r) => r.id}
        emptyMessage="No events recorded yet"
      />,
    );
    expect(screen.getByText('No events recorded yet')).toBeInTheDocument();
  });

  it('shows the error state and calls onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <DataGrid
        data={[]}
        columns={columns}
        getRowId={(r) => r.id}
        error="Failed to load events"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load events');

    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('marks the table as busy while loading', () => {
    render(
      <DataGrid data={[]} columns={columns} getRowId={(r) => r.id} loading />,
    );
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });
});

// ---- Row actions ---------------------------------------------------

describe('DataGrid — row actions', () => {
  it('renders an action button per row and calls onRowAction', async () => {
    const user = userEvent.setup();
    const onRowAction = vi.fn();
    render(
      <DataGrid
        data={makeRows(2)}
        columns={columns}
        getRowId={(r) => r.id}
        onRowAction={onRowAction}
        rowActionLabel="View"
      />,
    );
    const buttons = screen.getAllByRole('button', { name: /view/i });
    expect(buttons).toHaveLength(2);

    await user.click(buttons[0]);
    expect(onRowAction).toHaveBeenCalledTimes(1);
    expect(onRowAction).toHaveBeenCalledWith(
      expect.objectContaining({ id: '0', name: 'Person 0' }),
    );
  });
});