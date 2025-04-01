import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import ScreenshotQueue from '../components/Queue/ScreenshotQueue';
import { ComplexitySection } from '../components/Solutions/ComplexitySection';
import { ContentSection } from '../components/Solutions/ContentSection';
import SolutionCommands from '../components/Solutions/SolutionCommands';
import { useSyncedStore } from '../lib/store';

interface SolutionSectionProps {
  title: string;
  content: string;
  isLoading: boolean;
}

function SolutionSection({ title, content, isLoading }: SolutionSectionProps) {
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

function Solutions() {
  const { extraScreenshotQueue, problemInfo, solutionData } = useSyncedStore();

  const handleDeleteExtraScreenshot = async (index: number) => {
    const screenshotToDelete = extraScreenshotQueue[index];

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.id,
      );

      if (!response.success) {
        console.error('Failed to delete extra screenshot:', response.error);
      }
    } catch (error) {
      console.error('Error deleting extra screenshot:', error);
    }
  };

  // if (!isResetting && queryClient.getQueryData(['new_solution'])) {
  //   return (
  //     <Debug
  //       isProcessing={debugProcessing}
  //       setIsProcessing={setDebugProcessing}
  //     />
  //   );
  // }

  return (
    <div className="relative space-y-3 px-4 py-3">
      {/* Conditionally render the screenshot queue if solutionData is available */}
      {solutionData && (
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
      )}

      {/* Navbar of commands with the SolutionsHelper */}
      <SolutionCommands
        isProcessing={!problemInfo || !solutionData}
        extraScreenshots={extraScreenshotQueue}
      />

      {/* Main Content - Modified width constraints */}
      <div className="w-full text-sm text-black bg-black/60 rounded-md">
        <div className="rounded-lg overflow-hidden">
          <div className="px-4 py-3 space-y-4 max-w-full">
            <ContentSection
              title="Problem Statement"
              content={problemInfo?.problem_statement}
              isLoading={!problemInfo}
            />

            {solutionData ? (
              <>
                <ContentSection
                  title="My Thoughts"
                  content={
                    solutionData.thoughts && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          {solutionData.thoughts.map((thought) => (
                            <div
                              key={thought}
                              className="flex items-start gap-2"
                            >
                              <div className="w-1 h-1 rounded-full bg-blue-400/80 mt-2 shrink-0" />
                              <div>{thought}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  isLoading={!solutionData}
                />

                <SolutionSection
                  title="Solution"
                  content={solutionData.code}
                  isLoading={!solutionData}
                />

                <ComplexitySection
                  timeComplexity={solutionData.time_complexity}
                  spaceComplexity={solutionData.space_complexity}
                  isLoading={!solutionData}
                />
              </>
            ) : (
              <div className="space-y-1.5">
                <div className="mt-4 flex">
                  <p className="text-xs bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
                    Loading solutions...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Solutions;
