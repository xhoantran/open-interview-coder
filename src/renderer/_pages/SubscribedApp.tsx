import { useSyncedStore } from '../lib/store';
import Queue from './Queue';
import Solutions from './Solutions';

export function SubscribedApp() {
  const { view } = useSyncedStore();

  if (view === 'queue') {
    return (
      <div className="min-h-0">
        <Queue />
      </div>
    );
  }

  if (view === 'solutions') {
    return (
      <div className="min-h-0">
        <Solutions />
      </div>
    );
  }

  return <div className="min-h-0" />;
}
