import { useSyncedStore } from '../../lib/store';
import { ComplexitySection } from './components/ComplexitySection';
import { ContentSection } from './components/ContentSection';
import SolutionCommands from './components/SolutionCommands';
import { SolutionSection } from './components/SolutionSection';

function Solutions() {
  const { problemInfo, solutionData } = useSyncedStore();

  return (
    <div className="relative space-y-3 px-4 py-3">
      {/* Navbar of commands with the SolutionsHelper */}
      <SolutionCommands />

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
