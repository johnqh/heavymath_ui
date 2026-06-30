import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

interface FavoriteStarProps {
  favorited: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Total favorite count across all users. Hidden when 0 or undefined. */
  count?: number;
  /** Accessible label when favorited */
  removeLabel?: string;
  /** Accessible label when not favorited */
  addLabel?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const buttonSizeClasses = {
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-2',
};

const countSizeClasses = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

export function FavoriteStar({
  favorited,
  onToggle,
  isLoading = false,
  disabled = false,
  className = '',
  size = 'md',
  count,
  removeLabel,
  addLabel,
}: FavoriteStarProps) {
  const text = useHeavymathUiText();
  const effectiveRemoveLabel = removeLabel ?? text('favorites.remove');
  const effectiveAddLabel = addLabel ?? text('favorites.add');
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && !disabled) {
      onToggle();
    }
  };

  const Icon = favorited ? StarSolid : StarOutline;
  const showCount = count !== undefined && count > 0;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        ${buttonSizeClasses[size]}
        rounded-full
        transition-all duration-200
        hover:bg-warning/10
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        inline-flex items-center gap-0.5
        ${className}
      `}
      title={favorited ? effectiveRemoveLabel : effectiveAddLabel}
      aria-label={favorited ? effectiveRemoveLabel : effectiveAddLabel}
    >
      <Icon
        className={`
          ${sizeClasses[size]}
          ${isLoading ? 'animate-pulse' : ''}
          ${favorited ? 'text-warning fill-warning' : 'text-muted-foreground hover:text-warning'}
          transition-colors duration-200
        `}
      />
      {showCount && (
        <span
          className={`${countSizeClasses[size]} font-medium tabular-nums ${
            favorited ? 'text-warning' : 'text-muted-foreground'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
