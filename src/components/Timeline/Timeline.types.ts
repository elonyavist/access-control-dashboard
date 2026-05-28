export interface TimelineItem {
  id: string;
  date: Date;
  title: string;
  description?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  /** Derives a group key from a date; items sharing a key are grouped. Default: by day. */
  groupBy?: (date: Date) => string;
  /** Formats a group's representative date. Receives a Date (not the key) to avoid re-parsing. Default: localized day. */
  formatGroupLabel?: (groupDate: Date) => string;
  /** Activated by click or Enter/Space. */
  onItemSelect?: (item: TimelineItem) => void;
  emptyMessage?: string;
}

/** Internal: a group of items with a representative date for the group header. */
export interface TimelineGroupData {
  key: string;
  date: Date;
  items: TimelineItem[];
}