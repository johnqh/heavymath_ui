import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface FavoriteStarProps {
  favorited: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Total favorite count across all users. Hidden when 0 or undefined. */
  count?: number;
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
}: FavoriteStarProps) {
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
        hover:bg-yellow-100 dark:hover:bg-yellow-900/30
        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        inline-flex items-center gap-0.5
        ${className}
      `}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Icon
        className={`
          ${sizeClasses[size]}
          ${isLoading ? 'animate-pulse' : ''}
          ${favorited ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 hover:text-yellow-500'}
          transition-colors duration-200
        `}
      />
      {showCount && (
        <span
          className={`${countSizeClasses[size]} font-medium tabular-nums ${
            favorited ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
