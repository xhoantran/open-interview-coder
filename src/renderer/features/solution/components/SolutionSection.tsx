import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useSyncedStore } from '../../../lib/store';

interface SolutionSectionProps {
  title: string;
  content: string;
  isLoading: boolean;
}

export function SolutionSection({
  title,
  content,
  isLoading,
}: SolutionSectionProps) {
  const { language } = useSyncedStore();

  return (
    <div className="space-y-2">
      <h2 className="text-[13px] font-medium text-white tracking-wide">
        {title}
      </h2>
      {isLoading ? (
        <div className="space-y-1.5">
          <div className="mt-4 flex">
            <p className="text-xs bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
              Loading solutions...
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <SyntaxHighlighter
            showLineNumbers
            language={language === 'Go' ? 'go' : language}
            style={dracula}
            customStyle={{
              maxWidth: '100%',
              margin: 0,
              padding: '1rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              backgroundColor: 'rgba(22, 27, 34, 0.5)',
            }}
            wrapLongLines
          >
            {content}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
