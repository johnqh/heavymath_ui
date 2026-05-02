import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@sudobility/components';
import { variants } from '@sudobility/design';
import type { SeasonOption } from '../../utils/sportsSeason';

interface SeasonSelectorProps {
  seasons: SeasonOption[];
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
  isLoading?: boolean;
}

export function SeasonSelector({
  seasons,
  selectedSeason,
  onSeasonChange,
  isLoading = false,
}: SeasonSelectorProps) {
  if (isLoading) {
    return <div className={`${variants.loading.skeleton.base()} rounded-lg h-10 w-32`} />;
  }

  if (seasons.length === 0) {
    return null;
  }

  return (
    <Select value={selectedSeason} onValueChange={onSeasonChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {seasons.map(season => (
          <SelectItem key={season.value} value={season.value}>
            {season.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
