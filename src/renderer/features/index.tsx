import { useSyncedStore } from '../lib/store';
import Queue from './queue';
import Solutions from './solution';

export function FeatureView() {
  const { view } = useSyncedStore();

  if (view === 'queue') return <Queue />;

  return <Solutions />;
}
