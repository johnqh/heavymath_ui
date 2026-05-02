import { useTranslation } from "react-i18next";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@sudobility/components";

interface DealerNFTSelectorProps {
  tokenIds: bigint[];
  selectedTokenId: bigint | undefined;
  onSelect: (tokenId: bigint) => void;
}

export function DealerNFTSelector({
  tokenIds,
  selectedTokenId,
  onSelect,
}: DealerNFTSelectorProps) {
  const { t } = useTranslation("common");

  if (tokenIds.length <= 1) return null;

  return (
    <div className="md:w-44">
      <label className="block text-sm font-medium mb-1">
        {t("dealer.selectNFT", "Dealer NFT")}
      </label>
      <Select
        value={
          selectedTokenId !== undefined ? String(selectedTokenId) : undefined
        }
        onValueChange={(val) => onSelect(BigInt(val))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tokenIds.map((id) => (
            <SelectItem key={String(id)} value={String(id)}>
              {t("dealer.tokenLabel", "Token #{{id}}", { id: String(id) })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
