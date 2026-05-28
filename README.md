# Access control dashboard

A small library of three reusable React components, with a demo app showcasing them.

Stack: Vite + React 19 + TypeScript (strict), Tailwind, shadcn/ui (Radix), Vitest.

## Components

### DataGrid

Generic over arbitrary row data (`DataGrid<T>`). Client-side pagination, sorting, and
column filtering, with configurable columns (hide/show, label, accessor as
`keyof T | (row) => unknown`). Loading / empty / error states. Reusable because it makes no
assumption about the shape of a row — column definitions describe how to read and render each.

### Timeline

Renders items (`{ id, date, title, description? }`) grouped by calendar day, with an optional
`groupBy` for other temporal granularities. Keyboard navigable with a roving tabindex —
Up/Down between items, Left/Right between day groups — and `aria-live` announcements when focus
crosses a group. The fixed item shape is deliberate: a timeline needs few fields, so callers
map to them in one line rather than threading a generic.

### Form (add / edit)

A controlled form with two fixed fields (title, date) and validation: required title, valid
date, first-invalid-field focus, and a `role="status"` success region. One component serves
both add and edit (`initialValue` is the mode), decoupled from any store (`onSave`) and from
its container (the modal is mounted by the caller). Reusable as a flow, not as a configurable
form builder.

## Design notes

- **Calibrated abstraction**: each component is generic only to the degree its job needs —
  DataGrid over any row type, Timeline over any temporal data, the Form across add/edit. Not
  abstraction applied mechanically.
- **Domain-agnostic components**: they raise callbacks and never touch a store, ids, or
  derived fields. The host app owns the domain logic.
- **State**: no global store or form library; shared state is explicit, and the form resets
  between records via `key` rather than syncing props into state.
- **Accessibility**: keyboard navigation and screen-reader announcements in the Timeline;
  `useId`-namespaced field/error links and post-commit focus management in the Form.