import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import ScreenshotQueue from '../components/Queue/ScreenshotQueue';
import { ComplexitySection } from '../components/Solutions/ComplexitySection';
import { ContentSection } from '../components/Solutions/ContentSection';
import SolutionCommands from '../components/Solutions/SolutionCommands';
import { useSyncedStore } from '../lib/store';

function CodeSection({
  code,
  isLoading,
}: {
  code: React.ReactNode;
  isLoading: boolean;
}) {
  const { language } = useSyncedStore();

  return (
    <div className="space-y-2">
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
            {code as string}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

interface DebugProps {
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

function Debug({ isProcessing, setIsProcessing }: DebugProps) {
  const { extraScreenshotQueue } = useSyncedStore();

  const [newCode, setNewCode] = useState<string | null>(null);
  const [thoughtsData, setThoughtsData] = useState<string[] | null>(null);
  const [timeComplexityData, setTimeComplexityData] = useState<string | null>(
    null,
  );
  const [spaceComplexityData, setSpaceComplexityData] = useState<string | null>(
    null,
  );

  const [toastOpen, setToastOpen] = useState(false);

  const handleDeleteExtraScreenshot = async (index: number) => {
    const screenshotToDelete = extraScreenshotQueue[index];

    try {
      await window.electronAPI.deleteScreenshot(screenshotToDelete.id);
    } catch (error) {
      console.error('Error deleting extra screenshot:', error);
    }
  };

  return (
    <div className="relative space-y-3 px-4 py-3">
      {/* Conditionally render the screenshot queue */}
      <div className="bg-transparent w-fit">
        <div className="pb-3">
          <div className="space-y-3 w-fit">
            <ScreenshotQueue
              screenshots={extraScreenshotQueue}
              onDeleteScreenshot={handleDeleteExtraScreenshot}
            />
          </div>
        </div>
      </div>

      {/* Navbar of commands with the tooltip */}
      <SolutionCommands
        screenshots={extraScreenshotQueue}
        isProcessing={isProcessing}
        extraScreenshots={extraScreenshotQueue}
      />

      {/* Main Content */}
      <div className="w-full text-sm text-black bg-black/60 rounded-md">
        <div className="rounded-lg overflow-hidden">
          <div className="px-4 py-3 space-y-4">
            {/* Thoughts Section */}
            <ContentSection
              title="What I Changed"
              content={
                thoughtsData && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      {thoughtsData.map((thought) => (
                        <div key={thought} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-400/80 mt-2 shrink-0" />
                          <div>{thought}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              isLoading={!thoughtsData}
            />

            {/* Code Section */}
            <CodeSection code={newCode} isLoading={!newCode} />

            {/* Complexity Section */}
            <ComplexitySection
              timeComplexity={timeComplexityData}
              spaceComplexity={spaceComplexityData}
              isLoading={!timeComplexityData || !spaceComplexityData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Debug;
