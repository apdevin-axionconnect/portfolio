import { useCallback } from 'react';
import { useOS } from '../os/OS';

// Window-scoped state that both the toolbar (rendered by Window) and the body can read/write.
export function useWinProps(win, defaults = {}) {
  const { update } = useOS();
  const props = { ...defaults, ...win.props };
  const set = useCallback((patch) => update(win.id, { props: { ...defaults, ...win.props, ...patch } }), [update, win.id, win.props, defaults]);
  return [props, set];
}
