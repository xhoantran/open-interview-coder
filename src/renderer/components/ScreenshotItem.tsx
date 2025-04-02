import { X } from 'lucide-react';
import { Screenshot } from '../../types';

interface ScreenshotItemProps {
  screenshot: Screenshot;
  onDelete: (index: number) => void;
  index: number;
}

function ScreenshotItem({ screenshot, onDelete, index }: ScreenshotItemProps) {
  const handleDelete = async () => {
    await onDelete(index);
  };

  return (
    <div className="border border-white relative w-[128px] h-[72px]">
      <div className="w-full h-full relative">
        <img
          src={`data:image/png;base64,${screenshot.data}`}
          alt="Screenshot"
          className="w-full h-full object-cover transition-transform duration-300 cursor-pointer group-hover:scale-105 group-hover:brightness-75"
        />
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="absolute top-2 left-2 p-1 rounded-full bg-white bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Delete screenshot"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default ScreenshotItem;
