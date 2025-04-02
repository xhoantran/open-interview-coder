import { useSyncedStore } from '../../lib/store';
import QueueCommands from './components/QueueCommands';
import ScreenshotQueue from '../../components/ScreenshotQueue';

function Queue() {
  const { screenshotQueue } = useSyncedStore();

  const handleDeleteScreenshot = async (index: number) => {
    const screenshotToDelete = screenshotQueue[index];

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.id,
      );

      if (!response.success) {
        console.error('Failed to delete screenshot:', response.error);
      }
    } catch (error) {
      console.error('Error deleting screenshot:', error);
    }
  };

  return (
    <div className="bg-transparent w-1/2">
      <div className="px-4 py-3">
        <div className="space-y-3 w-fit">
          <ScreenshotQueue
            screenshots={screenshotQueue}
            onDeleteScreenshot={handleDeleteScreenshot}
          />

          <QueueCommands />
        </div>
      </div>
    </div>
  );
}

export default Queue;
