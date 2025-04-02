export function ComplexitySection({
  timeComplexity,
  spaceComplexity,
  isLoading,
}: {
  timeComplexity: string | null;
  spaceComplexity: string | null;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-[13px] font-medium text-white tracking-wide">
        Complexity
      </h2>
      {isLoading ? (
        <p className="text-xs bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
          Calculating complexity...
        </p>
      ) : (
        <div className="space-y-1">
          <div className="flex items-start gap-2 text-[13px] leading-[1.4] text-gray-100">
            <div className="w-1 h-1 rounded-full bg-blue-400/80 mt-2 shrink-0" />
            <div>
              <strong>Time:</strong> {timeComplexity}
            </div>
          </div>
          <div className="flex items-start gap-2 text-[13px] leading-[1.4] text-gray-100">
            <div className="w-1 h-1 rounded-full bg-blue-400/80 mt-2 shrink-0" />
            <div>
              <strong>Space:</strong> {spaceComplexity}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
