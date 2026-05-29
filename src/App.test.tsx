import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App — event flows', () => {
  it('adds a new event to both the timeline and the grid, and announces it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /new event/i }));

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/title/i), 'Front door breach');
    // Far-future date guarantees the new event sorts to the top of the grid (date desc)
    // and the timeline, so it lands on the first grid page deterministically.
    await user.type(within(dialog).getByLabelText(/date/i), '2030-01-01T09:15');
    await user.click(within(dialog).getByRole('button', { name: /create/i }));

    const timeline = screen.getByRole('region', { name: /recent activity/i });
    expect(within(timeline).getByText('Front door breach')).toBeInTheDocument();

    const grid = screen.getByRole('region', { name: /access log/i });
    expect(within(grid).getByText('Front door breach')).toBeInTheDocument();

    // App-level live region carries the announcement (queried by text to avoid the
    // multiple role="status" regions from Timeline / EventForm).
    expect(screen.getByText(/added to the log and timeline/i)).toBeInTheDocument();
  });

  it('edits an event and reflects the change in both views', async () => {
    const user = userEvent.setup();
    render(<App />);

    const grid = screen.getByRole('region', { name: /access log/i });
    // First row = most recent event (default sort = Time desc); editing keeps its date,
    // so it stays at the top of both the grid and the timeline.
    await user.click(within(grid).getAllByRole('button', { name: /edit/i })[0]);

    const dialog = screen.getByRole('dialog');
    const title = within(dialog).getByLabelText(/title/i);
    await user.clear(title);
    await user.type(title, 'Renamed entry');
    await user.click(within(dialog).getByRole('button', { name: /save/i }));

    expect(within(grid).getByText('Renamed entry')).toBeInTheDocument();

    const timeline = screen.getByRole('region', { name: /recent activity/i });
    expect(within(timeline).getByText('Renamed entry')).toBeInTheDocument();

    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });
});
