import { useOutletContext } from 'react-router-dom';
import type { User } from '../api/types';

export interface LayoutContext {
  user: User | undefined;
}

/** The logged-in user, loaded once by AppLayout. */
export function useCurrentUser(): User | undefined {
  return useOutletContext<LayoutContext>().user;
}
