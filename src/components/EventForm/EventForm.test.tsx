import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EventForm } from './EventForm';

describe('EventForm — rendering', () => {
  it('renders empty in add mode with a Create button', () => {
    render(<EventForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('prefills in edit mode with a Save button', () => {
    render(
      <EventForm
        initialValue={{ title: 'Existing', date: '2026-05-28T10:00' }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing');
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });
});

describe('EventForm — validation & focus', () => {
  it('shows errors and focuses the first invalid field on empty submit', async () => {
    const user = userEvent.setup();
    render(<EventForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/date is required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveFocus();
  });

  it('focuses the first invalid field with its error link wired correctly', async () => {
    const user = userEvent.setup();
    render(<EventForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /create/i }));
    const title = screen.getByLabelText(/title/i);
    const errorEl = screen.getByText(/title is required/i);
    expect(title).toHaveFocus();
    expect(title).toHaveAttribute('aria-describedby', errorEl.id);
  });

  it('focuses date when only date is invalid', async () => {
    const user = userEvent.setup();
    render(<EventForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await user.type(screen.getByLabelText(/title/i), 'Valid title');
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(screen.getByLabelText(/date/i)).toHaveFocus();
  });

  it('does not call onSave when invalid', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EventForm onSave={onSave} onCancel={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('EventForm — save flow', () => {
  it('trims the title and calls onSave with valid values', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EventForm onSave={onSave} onCancel={vi.fn()} />);
    await user.type(screen.getByLabelText(/title/i), '  My event  ');
    await user.type(screen.getByLabelText(/date/i), '2026-05-28T14:32');
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(onSave).toHaveBeenCalledWith({ title: 'My event', date: '2026-05-28T14:32' });
  });

  it('shows the success region after a valid save', async () => {
    const user = userEvent.setup();
    render(<EventForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await user.type(screen.getByLabelText(/title/i), 'My event');
    await user.type(screen.getByLabelText(/date/i), '2026-05-28T14:32');
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/event saved/i);
  });

  it('clears the success message on the next keystroke', async () => {
    const user = userEvent.setup();
    render(<EventForm onSave={vi.fn()} onCancel={vi.fn()} />);
    await user.type(screen.getByLabelText(/title/i), 'My event');
    await user.type(screen.getByLabelText(/date/i), '2026-05-28T14:32');
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/title/i), 'x');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<EventForm onSave={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('EventForm — edit mode', () => {
  it('saves edited values, preserving the untouched field', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <EventForm
        initialValue={{ title: 'Old', date: '2026-05-28T10:00' }}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'New');
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith({ title: 'New', date: '2026-05-28T10:00' });
  });
});

describe('EventForm — reusability', () => {
  it('gives each mounted instance distinct field ids', () => {
    const { container } = render(
      <>
        <EventForm onSave={vi.fn()} onCancel={vi.fn()} />
        <EventForm onSave={vi.fn()} onCancel={vi.fn()} />
      </>,
    );
    const ids = Array.from(container.querySelectorAll('input[id]')).map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
