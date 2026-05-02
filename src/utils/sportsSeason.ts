export interface SeasonOption {
  value: string;
  label: string;
}

export function formatSeasonLabel(value: string | number): string {
  return String(value);
}

export function normalizeSeasonSortValue(value: string | number): number {
  if (typeof value === 'number') return value;

  const matches = value.match(/\d{4}/g);
  if (matches && matches.length > 0) {
    return Number(matches[matches.length - 1]);
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

export function buildSeasonOptions<T>(
  seasons: T[],
  getValue: (season: T) => string | number
): SeasonOption[] {
  const uniqueOptions = new Map<string, SeasonOption>();

  seasons.forEach(season => {
    const rawValue = getValue(season);
    const value = String(rawValue);

    if (!uniqueOptions.has(value)) {
      uniqueOptions.set(value, {
        value,
        label: formatSeasonLabel(rawValue),
      });
    }
  });

  return Array.from(uniqueOptions.values()).sort(
    (a, b) => normalizeSeasonSortValue(b.value) - normalizeSeasonSortValue(a.value)
  );
}

export function hasSeasonValue<T>(
  seasons: T[],
  selectedSeason: string | undefined,
  getValue: (season: T) => string | number
): boolean {
  if (!selectedSeason) return false;

  return seasons.some(season => String(getValue(season)) === selectedSeason);
}

export function getNumericSeasonValue(season: string | number, fallback: number): number {
  if (typeof season === 'number') return season;

  const parsed = Number.parseInt(season, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}
