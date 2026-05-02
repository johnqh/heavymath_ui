import { useTranslation } from 'react-i18next';
import { MarketCard } from './MarketCard';
import type { Market } from '@heavymath/indexer_client';

interface MarketListProps {
  markets: Market[];
  isLoading?: boolean;
  showCategory?: boolean;
}

export function MarketList({
  markets,
  isLoading = false,
  showCategory = true,
}: MarketListProps) {
  const { t } = useTranslation('markets');

  if (isLoading) {
    return (
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <MarketCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className='text-center py-16'>
        <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4'>
          <span className='text-2xl'>📊</span>
        </div>
        <h3 className='text-lg font-semibold mb-2'>{t('empty.title')}</h3>
        <p className='text-muted-foreground'>{t('empty.description')}</p>
      </div>
    );
  }

  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {markets.map(market => (
        <MarketCard
          key={market.id}
          market={market}
          showCategory={showCategory}
        />
      ))}
    </div>
  );
}

function MarketCardSkeleton() {
  return (
    <div className='p-6 rounded-lg border border-border bg-card animate-pulse'>
      <div className='flex items-start justify-between gap-4 mb-4'>
        <div className='flex-1'>
          <div className='h-3 bg-muted rounded w-20 mb-2'></div>
          <div className='h-5 bg-muted rounded w-full mb-1'></div>
          <div className='h-5 bg-muted rounded w-2/3'></div>
        </div>
        <div className='h-6 bg-muted rounded w-16'></div>
      </div>
      <div className='h-4 bg-muted rounded w-full mb-2'></div>
      <div className='h-4 bg-muted rounded w-3/4 mb-4'></div>
      <div className='flex justify-between pt-4 border-t border-border'>
        <div className='h-3 bg-muted rounded w-24'></div>
        <div className='h-3 bg-muted rounded w-20'></div>
      </div>
    </div>
  );
}
