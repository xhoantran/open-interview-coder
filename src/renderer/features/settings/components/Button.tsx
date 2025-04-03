import { cn } from '../../../lib/utils';

interface ButtonProps {
  onClick: () => void;
  title: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function Button(props: ButtonProps) {
  const { onClick, title, className, variant } = props;

  return (
    <button
      type="button"
      className={cn(
        'rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-white/20',
        className,
        variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
        variant === 'secondary' && 'bg-gray-500 text-white hover:bg-gray-600',
      )}
      onClick={onClick}
    >
      {title}
    </button>
  );
}
