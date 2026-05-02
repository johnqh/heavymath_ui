import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIndexer } from "../../context/IndexerContext";
import { useGameMarkets } from "../../hooks/useGameMarkets";
import { MarketCard } from "./MarketCard";
import { InlineCreateMarketForm } from "./InlineCreateMarketForm";
import type { SportCode } from "../../config/sportCodes";
import { variants } from "@sudobility/design";

interface GameMarketsSectionProps {
  sportCode: SportCode;
  gameId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId?: number;
  awayTeamId?: number;
  gameDate: Date;
  leagueName?: string;
  variant?: "team-sport" | "individual-sport" | "race";
  gameStarted?: boolean;
}

export function GameMarketsSection({
  sportCode,
  gameId,
  homeTeamName,
  awayTeamName,
  homeTeamId,
  awayTeamId,
  gameDate,
  leagueName,
  variant = "team-sport",
  gameStarted = false,
}: GameMarketsSectionProps) {
  const { t } = useTranslation("common");
  const { indexerClient } = useIndexer();
  const { data: markets, isLoading } = useGameMarkets(
    indexerClient,
    sportCode,
    gameId,
  );
  const [isPolling, setIsPolling] = useState(false);

  const hasMarkets = markets && markets.length > 0;

  const noMarketsText = t(
    "markets.noMarketsForGame",
    "No prediction markets for this game yet.",
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-4">
        <h2 className="text-lg font-semibold">
          {t("markets.predictionMarkets", "Prediction Markets")}
        </h2>
        {!isLoading && !hasMarkets && !isPolling && (
          <span className="text-sm text-muted-foreground">{noMarketsText}</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className={`${variants.loading.skeleton.base()} rounded-lg h-24`}
            />
          ))}
        </div>
      ) : hasMarkets ? (
        <div className="space-y-3 mb-4">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} showCategory={false} />
          ))}
        </div>
      ) : isPolling ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {t("markets.updatingMarkets", "Updating prediction markets...")}
        </div>
      ) : null}

      <InlineCreateMarketForm
        sportCode={sportCode}
        gameId={gameId}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeTeamId={homeTeamId}
        awayTeamId={awayTeamId}
        gameDate={gameDate}
        leagueName={leagueName}
        variant={variant}
        onPollingChange={setIsPolling}
        gameStarted={gameStarted}
      />
    </div>
  );
}
