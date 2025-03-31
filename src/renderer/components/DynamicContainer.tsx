import React, { useCallback, useEffect } from 'react';

export function DynamicContainer(props: React.PropsWithChildren) {
  const { children } = props;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const height = containerRef.current.scrollHeight;
    const width = containerRef.current.scrollWidth;
    window.electronAPI.updateContentDimensions({ width, height });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Also watch DOM changes
    const mutationObserver = new MutationObserver(updateDimensions);
    mutationObserver.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });

    // Initial dimension update
    updateDimensions();

    // eslint-disable-next-line consistent-return
    return () => {
      mutationObserver.disconnect();
    };
  }, [updateDimensions]);

  return <div ref={containerRef}>{children}</div>;
}
