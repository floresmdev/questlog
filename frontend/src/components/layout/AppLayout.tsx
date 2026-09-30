import { Outlet } from 'react-router-dom';
import { api } from '../../api';
import { useApi } from '../../hooks/useApi';
import type { LayoutContext } from '../../hooks/useCurrentUser';
import { Sidebar } from './Sidebar';

/** Sidebar + routed page. Pages render their own TopBar since its content varies. */
export function AppLayout() {
  const { data: user } = useApi(() => api.getCurrentUser());
  const { data: currentBuild } = useApi(() => api.getCurrentBuild());

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar user={user} currentBuild={currentBuild} />
      <main className="flex min-w-0 flex-grow flex-col">
        <Outlet context={{ user } satisfies LayoutContext} />
      </main>
    </div>
  );
}
