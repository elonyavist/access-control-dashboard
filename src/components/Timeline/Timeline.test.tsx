import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Timeline } from './Timeline';
import type { TimelineItem } from './Timeline.types';

const items: TimelineItem[] = [
  { id: '1', date: new Date('2026-05-28T14:32'), title: 'Afternoon 28', description: 'Main' },
  { id: '2', date: new Date('2026-05-28T08:00'), title: 'Morning 28', description: 'East' },
  { id: '3', date: new Date('2026-05-27T18:40'), title: 'Evening 27', description: 'Bay' },
];

describe('Timeline — rendering', () => {
  it('renders all items', () => {
    render(<Timeline items={items} />);
    expect(screen.getByText('Afternoon 28')).toBeInTheDocument();
    expect(screen.getByText('Morning 28')).toBeInTheDocument();
    expect(screen.getByText('Evening 27')).toBeInTheDocument();
  });

  it('renders a group region per day', () => {
    render(<Timeline items={items} />);
    expect(screen.getAllByRole('group')).toHaveLength(2);
  });

  it('shows the empty state when there are no items', () => {
    render(<Timeline items={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});

describe('Timeline — selection', () => {
  it('calls onItemSelect on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Timeline items={items} onItemSelect={onSelect} />);
    await user.click(screen.getByText('Afternoon 28'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('activates with Enter and Space', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Timeline items={items} onItemSelect={onSelect} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});

describe('Timeline — keyboard navigation', () => {
  it('moves focus down through items across day boundaries', async () => {
    const user = userEvent.setup();
    render(<Timeline items={items} />);
    await user.tab();
    expect(screen.getByText('Afternoon 28').closest('button')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Morning 28').closest('button')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Evening 27').closest('button')).toHaveFocus();
  });

  it('jumps to the next group with ArrowRight', async () => {
    const user = userEvent.setup();
    render(<Timeline items={items} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Evening 27').closest('button')).toHaveFocus();
  });

  it('jumps to the previous group with ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<Timeline items={items} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Afternoon 28').closest('button')).toHaveFocus();
  });

  it('only has one tab stop (roving tabindex)', async () => {
    const user = userEvent.setup();
    render(<Timeline items={items} />);
    await user.tab();
    expect(screen.getByText('Afternoon 28').closest('button')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('Afternoon 28').closest('button')).not.toHaveFocus();
  });
});

describe('Timeline — announcements', () => {
  it('updates the live region when focus moves', async () => {
    const user = userEvent.setup();
    render(<Timeline items={items} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('status')).toHaveTextContent('Morning 28');
  });
});
