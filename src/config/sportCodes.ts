/**
 * @fileoverview Sport code constants and helpers
 * @description Maps sport slugs to numeric codes used as market subCategory
 * values and in oracleId encoding.
 */

/** Numeric sport codes matching market subCategory values for SPORTS category */
export const SPORT_CODES = {
  soccer: 1,
  basketball: 2,
  nfl: 3,
  baseball: 4,
  hockey: 5,
  rugby: 6,
  f1: 7,
  mma: 8,
  handball: 9,
  volleyball: 10,
} as const;

/** Numeric sport code value */
export type SportCode = (typeof SPORT_CODES)[keyof typeof SPORT_CODES];

/** Sport URL slug */
export type SportSlug = keyof typeof SPORT_CODES;

const slugByCode = Object.fromEntries(
  Object.entries(SPORT_CODES).map(([slug, code]) => [code, slug])
) as Record<SportCode, SportSlug>;

/**
 * Get the URL slug for a numeric sport code.
 *
 * @param code - Numeric sport code
 * @returns The sport slug (e.g., 'soccer') or undefined if invalid
 */
export function getSportSlug(code: number): SportSlug | undefined {
  return slugByCode[code as SportCode];
}

/**
 * Get the numeric code for a sport slug.
 *
 * @param slug - Sport URL slug (e.g., 'soccer')
 * @returns The numeric sport code or undefined if invalid
 */
export function getSportCode(slug: string): SportCode | undefined {
  return SPORT_CODES[slug as SportSlug];
}

/**
 * Type guard to check if a number is a valid sport code.
 *
 * @param value - Number to check
 * @returns True if value is a valid SportCode
 */
export function isSportCode(value: number): value is SportCode {
  return value >= 1 && value <= 10 && Number.isInteger(value);
}

/**
 * Get the event page path segment for a sport.
 * Soccer uses "matches", F1 uses "races", MMA uses "fights", others use "games".
 */
export function getSportEventPath(slug: SportSlug): string {
  switch (slug) {
    case 'soccer':
      return 'matches';
    case 'f1':
      return 'races';
    case 'mma':
      return 'fights';
    default:
      return 'games';
  }
}

/**
 * Build the full event page URL for a sport event.
 *
 * @param lang - Language prefix
 * @param sportCode - Numeric sport code
 * @param gameId - Game/fixture/race/fight ID
 * @returns URL path like /en/sports/soccer/matches/123, or null if invalid sport
 */
export function getSportEventUrl(lang: string, sportCode: number, gameId: number): string | null {
  const slug = getSportSlug(sportCode);
  if (!slug) return null;
  const segment = getSportEventPath(slug);
  return `/${lang}/sports/${slug}/${segment}/${gameId}`;
}
