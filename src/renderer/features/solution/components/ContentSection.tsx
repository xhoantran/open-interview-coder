import type { ReactNode } from 'react';

interface ContentSectionProps {
  title: string;
  content: ReactNode;
  isLoading: boolean;
}

export function ContentSection({
  title,
  content,
  isLoading,
}: ContentSectionProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-[13px] font-medium text-white tracking-wide">
        {title}
      </h2>
      {isLoading ? (
        <div className="mt-4 flex">
          <p className="text-xs bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
            Extracting problem statement...
          </p>
        </div>
      ) : (
        <div className="text-[13px] leading-[1.4] text-gray-100 max-w-[600px]">
          {content}
        </div>
      )}
    </div>
  );
}
