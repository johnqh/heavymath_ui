import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@sudobility/components';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

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
  const text = useHeavymathUiText();

  if (tokenIds.length <= 1) return null;

  return (
    <div className='md:w-44'>
      <label className='block text-sm font-medium mb-1'>
        {text('dealer.selectNFT')}
      </label>
      <Select
        value={
          selectedTokenId !== undefined ? String(selectedTokenId) : undefined
        }
        onValueChange={val => onSelect(BigInt(val))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tokenIds.map(id => (
            <SelectItem key={String(id)} value={String(id)}>
              {text('dealer.tokenLabel', { id: String(id) })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
