// Debug.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import ScreenshotQueue from '../components/Queue/ScreenshotQueue';
import { ComplexitySection } from '../components/Solutions/ComplexitySection';
import { ContentSection } from '../components/Solutions/ContentSection';
import SolutionCommands from '../components/Solutions/SolutionCommands';
import {
  Toast,
  ToastDescription,
  ToastMessage,
  ToastTitle,
  ToastVariant,
} from '../components/ui/toast';
import { Screenshot } from '../types/screenshots';

function CodeSection({
  code,
  isLoading,
  currentLanguage,
}: {
  code: React.ReactNode;
  isLoading: boolean;
  currentLanguage: string;
}) {
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
            language={currentLanguage === 'golang' ? 'go' : currentLanguage}
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

async function fetchScreenshots(): Promise<Screenshot[]> {
  try {
    const existing = await window.electronAPI.getScreenshots();
    console.log('Raw screenshot data in Debug:', existing);
    return (Array.isArray(existing) ? existing : []).map((p) => ({
      id: p.path,
      path: p.path,
      preview: p.preview,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error loading screenshots:', error);
    throw error;
  }
}

interface DebugProps {
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

function Debug({
  isProcessing,
  setIsProcessing,
  currentLanguage,
  setLanguage,
}: DebugProps) {
  const { data: screenshots = [], refetch } = useQuery<Screenshot[]>({
    queryKey: ['screenshots'],
    queryFn: fetchScreenshots,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const [newCode, setNewCode] = useState<string | null>(null);
  const [thoughtsData, setThoughtsData] = useState<string[] | null>(null);
  const [timeComplexityData, setTimeComplexityData] = useState<string | null>(
    null,
  );
  const [spaceComplexityData, setSpaceComplexityData] = useState<string | null>(
    null,
  );

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage>({
    title: '',
    description: '',
    variant: 'neutral',
  });

  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLDivElement>(null);

  const showToast = (
    title: string,
    description: string,
    variant: ToastVariant,
  ) => {
    setToastMessage({ title, description, variant });
    setToastOpen(true);
  };

  const handleDeleteExtraScreenshot = async (index: number) => {
    const screenshotToDelete = screenshots[index];

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path,
      );

      if (response.success) {
        refetch();
      } else {
        console.error('Failed to delete extra screenshot:', response.error);
      }
    } catch (error) {
      console.error('Error deleting extra screenshot:', error);
    }
  };

  useEffect(() => {
    // Try to get the new solution data from cache first
    const newSolution = queryClient.getQueryData(['new_solution']) as {
      new_code: string;
      thoughts: string[];
      time_complexity: string;
      space_complexity: string;
    } | null;

    // If we have cached data, set all state variables to the cached data
    if (newSolution) {
      setNewCode(newSolution.new_code || null);
      setThoughtsData(newSolution.thoughts || null);
      setTimeComplexityData(newSolution.time_complexity || null);
      setSpaceComplexityData(newSolution.space_complexity || null);
      setIsProcessing(false);
    }

    // Set up event listeners
    const cleanupFunctions = [
      window.electronAPI.onScreenshotTaken(() => refetch()),
      window.electronAPI.onResetView(() => refetch()),
      window.electronAPI.onDebugSuccess(() => {
        setIsProcessing(false);
      }),
      window.electronAPI.onDebugStart(() => {
        setIsProcessing(true);
      }),
      window.electronAPI.onDebugError((error: string) => {
        showToast(
          'Processing Failed',
          'There was an error debugging your code.',
          'error',
        );
        setIsProcessing(false);
        console.error('Processing error:', error);
      }),
    ];

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [queryClient, refetch, setIsProcessing]);

  return (
    <div ref={contentRef} className="relative space-y-3 px-4 py-3">
      <Toast
        open={toastOpen}
        onOpenChange={setToastOpen}
        variant={toastMessage.variant}
        duration={3000}
      >
        <ToastTitle>{toastMessage.title}</ToastTitle>
        <ToastDescription>{toastMessage.description}</ToastDescription>
      </Toast>

      {/* Conditionally render the screenshot queue */}
      <div className="bg-transparent w-fit">
        <div className="pb-3">
          <div className="space-y-3 w-fit">
            <ScreenshotQueue
              screenshots={screenshots}
              onDeleteScreenshot={handleDeleteExtraScreenshot}
              isLoading={isProcessing}
            />
          </div>
        </div>
      </div>

      {/* Navbar of commands with the tooltip */}
      <SolutionCommands
        screenshots={screenshots}
        isProcessing={isProcessing}
        extraScreenshots={screenshots}
        currentLanguage={currentLanguage}
        setLanguage={setLanguage}
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
            <CodeSection
              code={newCode}
              isLoading={!newCode}
              currentLanguage={currentLanguage}
            />

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
