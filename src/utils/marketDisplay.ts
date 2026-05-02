/**
 * @fileoverview Market display helpers
 * @description Parses raw market data into human-readable display values.
 * The indexer stores title as "category-subCategory" (e.g., "1-1") and the
 * meaningful content in the description field as "title\nfull description".
 */

const CATEGORY_LABELS: Record<string, string> = {
  "1": "Sports",
  "2": "Crypto",
  "3": "Events",
};

const SPORT_LABELS: Record<string, string> = {
  "1": "Soccer",
  "2": "Basketball",
  "3": "NFL",
  "4": "Baseball",
  "5": "Hockey",
  "6": "Rugby",
  "7": "Formula 1",
  "8": "MMA",
  "9": "Handball",
  "10": "Volleyball",
};

export interface MarketDisplayInfo {
  /** Human-readable category (e.g., "Sports") */
  category: string | undefined;
  /** Human-readable subcategory for sports (e.g., "Soccer") */
  subcategory: string | undefined;
  /** The meaningful title extracted from description first line */
  displayTitle: string;
  /** Additional detail line (league + date), if present */
  displaySubtitle: string | undefined;
}

/**
 * Parse raw market fields into display-friendly values.
 *
 * @param market - Object with at least title, description, and id
 * @returns Parsed display info
 */
export function getMarketDisplayInfo(market: {
  id: string;
  title?: string | null;
  description?: string | null;
}): MarketDisplayInfo {
  // title is stored as "category-subCategory" (e.g., "1-1")
  const titleParts = (market.title || "").split("-");
  const categoryNum = titleParts[0];
  const subCategoryNum = titleParts[1];

  const category = CATEGORY_LABELS[categoryNum];
  const subcategory =
    categoryNum === "1" ? SPORT_LABELS[subCategoryNum] : undefined;

  // description stores: "meaningful title\nfull description with league and date"
  const lines = (market.description || "").split("\n");
  const firstLine = lines[0]?.trim();
  const restLines = lines.slice(1).join(" ").trim();

  const displayTitle = firstLine || market.title || `Market #${market.id}`;
  const displaySubtitle = restLines || undefined;

  return { category, subcategory, displayTitle, displaySubtitle };
}
