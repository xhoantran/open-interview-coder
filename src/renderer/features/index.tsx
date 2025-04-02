import { useSyncedStore } from '../lib/store';
import Queue from './queue';
import { Settings } from './settings';
import Solutions from './solution';

export function FeatureView() {
  const { view } = useSyncedStore();

  if (view === 'queue') return <Queue />;
  if (view === 'solutions') return <Solutions />;

  return <Settings />;
}
