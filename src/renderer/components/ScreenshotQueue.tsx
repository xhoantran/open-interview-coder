import { Screenshot } from '../../types';
import ScreenshotItem from './ScreenshotItem';

interface ScreenshotQueueProps {
  screenshots: Screenshot[];
  onDeleteScreenshot: (index: number) => void;
}
function ScreenshotQueue({
  screenshots,
  onDeleteScreenshot,
}: ScreenshotQueueProps) {
  if (screenshots.length === 0) {
    return null;
  }

  const displayScreenshots = screenshots.slice(0, 5);

  return (
    <div className="flex gap-4">
      {displayScreenshots.map((screenshot, index) => (
        <ScreenshotItem
          key={screenshot.id}
          screenshot={screenshot}
          index={index}
          onDelete={onDeleteScreenshot}
        />
      ))}
    </div>
  );
}

export default ScreenshotQueue;
