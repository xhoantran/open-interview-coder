import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useToast } from '../contexts/toast';
import Queue from './Queue';
import Solutions from './Solutions';
import { useSyncedStore } from '../lib/store';

interface SubscribedAppProps {
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

export function SubscribedApp({
  currentLanguage,
  setLanguage,
}: SubscribedAppProps) {
  const queryClient = useQueryClient();
  const { view, setView } = useSyncedStore();
  const { showToast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);

  // Let's ensure we reset queries etc. if some electron signals happen
  useEffect(() => {
    const cleanup = window.electronAPI.onResetView(() => {
      queryClient.invalidateQueries({
        queryKey: ['screenshots'],
      });
      queryClient.invalidateQueries({
        queryKey: ['problem_statement'],
      });
      queryClient.invalidateQueries({
        queryKey: ['solution'],
      });
      queryClient.invalidateQueries({
        queryKey: ['new_solution'],
      });
      setView('queue');
    });

    return () => {
      cleanup();
    };
  }, [queryClient, setView]);

  // Listen for events that might switch views or show errors
  useEffect(() => {
    const cleanupFunctions = [
      window.electronAPI.onSolutionStart(() => {
        setView('solutions');
      }),
      window.electronAPI.onUnauthorized(() => {
        queryClient.removeQueries({
          queryKey: ['screenshots'],
        });
        queryClient.removeQueries({
          queryKey: ['solution'],
        });
        queryClient.removeQueries({
          queryKey: ['problem_statement'],
        });
        setView('queue');
      }),
      window.electronAPI.onResetView(() => {
        queryClient.removeQueries({
          queryKey: ['screenshots'],
        });
        queryClient.removeQueries({
          queryKey: ['solution'],
        });
        queryClient.removeQueries({
          queryKey: ['problem_statement'],
        });
        setView('queue');
      }),
      window.electronAPI.onResetView(() => {
        queryClient.setQueryData(['problem_statement'], null);
      }),
      window.electronAPI.onProblemExtracted((data: any) => {
        if (view === 'queue') {
          queryClient.invalidateQueries({
            queryKey: ['problem_statement'],
          });
          queryClient.setQueryData(['problem_statement'], data);
        }
      }),
      window.electronAPI.onSolutionError((error: string) => {
        showToast('Error', error, 'error');
      }),
    ];
    return () => cleanupFunctions.forEach((fn) => fn());
  }, [queryClient, setView, showToast, view]);

  if (view === 'queue') {
    return (
      <div ref={containerRef} className="min-h-0">
        <Queue
          setView={setView}
          currentLanguage={currentLanguage}
          setLanguage={setLanguage}
        />
      </div>
    );
  }

  if (view === 'solutions') {
    return (
      <div ref={containerRef} className="min-h-0">
        <Solutions
          setView={setView}
          currentLanguage={currentLanguage}
          setLanguage={setLanguage}
        />
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-0" />;
}
