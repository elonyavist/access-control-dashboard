import { useCallback, useState } from 'react';

// Longer than the dialog's close animation (~100ms) so the live-region update lands AFTER a
// closing modal has released its aria-hidden on the rest of the page — otherwise screen
// readers never see the change (and it races with focus returning to the trigger).
const ANNOUNCE_DELAY_MS = 250;

/**
 * Drives a polite live region for transient status messages. `announce` clears then sets the
 * message a tick later, so identical consecutive messages still re-announce and the update
 * isn't swallowed while a modal is mid-close. Render `message` in an `aria-live="polite"`
 * region that is mounted up-front (not conditionally), e.g.:
 *
 *   const { message, announce } = useAnnouncer();
 *   <div role="status" aria-live="polite" className="sr-only">{message}</div>
 */
export function useAnnouncer() {
  const [message, setMessage] = useState('');

  const announce = useCallback((text: string) => {
    setMessage('');
    setTimeout(() => setMessage(text), ANNOUNCE_DELAY_MS);
  }, []);

  return { message, announce };
}
