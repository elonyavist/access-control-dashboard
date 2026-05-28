import type { KeyboardEvent, Ref } from 'react';
import { formatItemTime } from '../helpers';
import type { TimelineItem } from '../Timeline.types';

interface TimelineItemRowProps {
  item: TimelineItem;
  ariaLabel: string;
  isActive: boolean;
  buttonRef: Ref<HTMLButtonElement>;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
}

export function TimelineItemRow({
  item,
  ariaLabel,
  isActive,
  buttonRef,
  onClick,
  onKeyDown,
}: TimelineItemRowProps) {
  return (
    <li>
      <button
        ref={buttonRef}
        type="button"
        tabIndex={isActive ? 0 : -1}
        aria-label={ariaLabel}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className="flex w-full gap-3 rounded-md border border-transparent px-3 py-2 text-left hover:border-border hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="shrink-0 font-mono text-sm text-muted-foreground">
          {formatItemTime(item.date)}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-medium">{item.title}</span>
          {item.description && (
            <span className="text-sm text-muted-foreground">
              {item.description}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}
