import { useState } from 'react';

import { LanguageSelector } from '../../../components/LanguageSelector';
import { ShortcutCommand } from '../../../components/ShortcutCommand';
import { cn } from '../../../lib/utils';

interface QueueCommandsProps {
  screenshotCount?: number;
}

function QueueCommands({ screenshotCount = 0 }: QueueCommandsProps) {
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
        <div className="text-xs text-white/90 bg-black/60 rounded-lg py-2 px-4 flex items-center justify-center gap-4">
          {/* Screenshot */}
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
              {screenshotCount === 0 ? 'Take first screenshot' : 'Screenshot'}
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

          {/* Solve Command */}
          {screenshotCount > 0 && (
            <button
              type="button"
              className={cn(
                'flex flex-col cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 transition-colors',
              )}
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
              <div className="flex items-center justify-between">
                <span className="text-[11px] leading-none">Solve </span>
                <div className="flex gap-1 ml-2">
                  <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                    ⌘
                  </span>
                  <span className="bg-white/10 rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                    ↵
                  </span>
                </div>
              </div>
            </button>
          )}

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
                className="absolute top-full left-0 mt-2 transform -translate-x-[calc(50%-12px)]"
                style={{ zIndex: 100 }}
              >
                {/* Add transparent bridge */}
                <div className="absolute -top-2 right-0 w-full h-2" />
                <div className="p-3 text-xs bg-black/80 backdrop-blur-md rounded-lg border border-white/10 text-white/90 shadow-lg">
                  <div className="space-y-4">
                    <h3 className="font-medium truncate">Keyboard Shortcuts</h3>
                    <div className="space-y-3">
                      {/* Toggle Command */}
                      <ShortcutCommand
                        title="Toggle Window"
                        description="Show or hide the main window."
                        shortcut="⌘B"
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
                      />

                      {/* Screenshot Command */}
                      <ShortcutCommand
                        title="Take Screenshot"
                        description="Take a screenshot of the problem description."
                        shortcut="⌘H"
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
                            console.error('Error taking screenshot:', error);
                          }
                        }}
                      />

                      {/* Solve Command */}
                      <ShortcutCommand
                        title="Solve"
                        description={
                          screenshotCount > 0
                            ? 'Generate a solution based on the current problem.'
                            : 'Take a screenshot first to generate a solution.'
                        }
                        shortcut="⌘↵"
                        isDisabled={screenshotCount === 0}
                        onClick={async () => {
                          if (screenshotCount === 0) return;

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
                      />
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

export default QueueCommands;
