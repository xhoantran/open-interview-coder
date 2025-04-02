import { useState } from 'react';
import { Screenshot } from '../../../../types';
import { LanguageSelector } from '../../../components/LanguageSelector';

export interface SolutionCommandsProps {
  isProcessing: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  screenshots?: Screenshot[];
  extraScreenshots?: Screenshot[];
}

function SolutionCommands({
  isProcessing,
  extraScreenshots = [],
}: SolutionCommandsProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  return (
    <div>
      <div className="pt-2 w-fit">
        <div className="text-xs text-white/90 backdrop-blur-md bg-black/60 rounded-lg py-2 px-4 flex items-center justify-center gap-4">
          {/* Show/Hide - Always visible */}
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
            onClick={async () => {
              try {
                const result = await window.electronAPI.toggleMainWindow();
                if (!result.success) {
                  console.error('Failed to toggle window:', result.error);
                }
              } catch (error) {
                console.error('Error toggling window:', error);
              }
            }}
          >
            <span className="text-[11px] leading-none">Show/Hide</span>
            <div className="flex gap-1">
              <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                ⌘
              </span>
              <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                B
              </span>
            </div>
          </button>

          {/* Screenshot and Debug commands - Only show if not processing */}
          {!isProcessing && (
            <>
              <button
                type="button"
                className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                onClick={async () => {
                  try {
                    const result = await window.electronAPI.triggerScreenshot();
                    if (!result.success) {
                      console.error('Failed to take screenshot:', result.error);
                    }
                  } catch (error) {
                    console.error('Error taking screenshot:', error);
                  }
                }}
              >
                <span className="text-[11px] leading-none truncate">
                  {extraScreenshots.length === 0
                    ? 'Screenshot your code'
                    : 'Screenshot'}
                </span>
                <div className="flex gap-1">
                  <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                    ⌘
                  </span>
                  <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                    H
                  </span>
                </div>
              </button>

              {extraScreenshots.length > 0 && (
                <button
                  type="button"
                  className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                  onClick={async () => {
                    try {
                      const result =
                        await window.electronAPI.triggerProcessScreenshots();
                      if (!result.success) {
                        console.error(
                          'Failed to process screenshots:',
                          result.error,
                        );
                      }
                    } catch (error) {
                      console.error('Error processing screenshots:', error);
                    }
                  }}
                >
                  <span className="text-[11px] leading-none">Debug</span>
                  <div className="flex gap-1">
                    <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                      ⌘
                    </span>
                    <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                      ↵
                    </span>
                  </div>
                </button>
              )}
            </>
          )}

          {/* Start Over - Always visible */}
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
            onClick={async () => {
              try {
                const result = await window.electronAPI.triggerReset();
                if (!result.success) {
                  console.error('Failed to reset:', result.error);
                }
              } catch (error) {
                console.error('Error resetting:', error);
              }
            }}
          >
            <span className="text-[11px] leading-none">Start Over</span>
            <div className="flex gap-1">
              <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                ⌘
              </span>
              <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                R
              </span>
            </div>
          </button>

          {/* Separator */}
          <div className="mx-2 h-4 w-px bg-white/20" />

          {/* Settings with Tooltip */}
          <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Gear icon */}
            <div className="w-4 h-4 flex items-center justify-center cursor-pointer text-white/70 hover:text-white/90 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>

            {/* Tooltip Content */}
            {isTooltipVisible && (
              <div
                className="absolute top-full right-0 mt-2"
                style={{ zIndex: 100 }}
              >
                {/* Add transparent bridge */}
                <div className="absolute -top-2 right-0 w-full h-2" />
                <div className="p-3 text-xs bg-black/80 backdrop-blur-md rounded-lg border border-white/10 text-white/90 shadow-lg">
                  <div className="space-y-4">
                    <h3 className="font-medium whitespace-nowrap">
                      Keyboard Shortcuts
                    </h3>
                    <div className="space-y-3">
                      {/* Show/Hide - Always visible */}
                      <button
                        type="button"
                        className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                        onClick={async () => {
                          try {
                            const result =
                              await window.electronAPI.toggleMainWindow();
                            if (!result.success) {
                              console.error(
                                'Failed to toggle window:',
                                result.error,
                              );
                            }
                          } catch (error) {
                            console.error('Error toggling window:', error);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">Toggle Window</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              ⌘
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              B
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                          Show or hide this window.
                        </p>
                      </button>

                      {/* Screenshot and Debug commands - Only show if not processing */}
                      {!isProcessing && (
                        <>
                          <button
                            type="button"
                            className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                            onClick={async () => {
                              try {
                                const result =
                                  await window.electronAPI.triggerScreenshot();
                                if (!result.success) {
                                  console.error(
                                    'Failed to take screenshot:',
                                    result.error,
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  'Error taking screenshot:',
                                  error,
                                );
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">Take Screenshot</span>
                              <div className="flex gap-1 flex-shrink-0">
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                                  ⌘
                                </span>
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                                  H
                                </span>
                              </div>
                            </div>
                            <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                              Capture additional parts of the question or your
                              solution for debugging help.
                            </p>
                          </button>

                          {extraScreenshots.length > 0 && (
                            <button
                              type="button"
                              className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                              onClick={async () => {
                                try {
                                  const result =
                                    await window.electronAPI.triggerProcessScreenshots();
                                  if (!result.success) {
                                    console.error(
                                      'Failed to process screenshots:',
                                      result.error,
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    'Error processing screenshots:',
                                    error,
                                  );
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">Debug</span>
                                <div className="flex gap-1 flex-shrink-0">
                                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                                    ⌘
                                  </span>
                                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                                    ↵
                                  </span>
                                </div>
                              </div>
                              <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                                Generate new solutions based on all previous and
                                newly added screenshots.
                              </p>
                            </button>
                          )}
                        </>
                      )}

                      {/* Start Over - Always visible */}
                      <button
                        type="button"
                        className="cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors"
                        onClick={async () => {
                          try {
                            const result =
                              await window.electronAPI.triggerReset();
                            if (!result.success) {
                              console.error('Failed to reset:', result.error);
                            }
                          } catch (error) {
                            console.error('Error resetting:', error);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">Start Over</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              ⌘
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              R
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate mt-1">
                          Start fresh with a new question.
                        </p>
                      </button>
                    </div>

                    {/* Separator and Log Out */}
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <LanguageSelector />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SolutionCommands;
