import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/WalletAuthContext';
import { ui } from '@sudobility/design';

interface DealerRouteProps {
  children: React.ReactNode;
}

export function DealerRoute({ children }: DealerRouteProps) {
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation('common');
  const { isConnected, isDealer } = useAuth();

  // If not connected, redirect to connect page
  if (!isConnected) {
    return <Navigate to={`/${lang || 'en'}/connect`} replace />;
  }

  // If connected but not a dealer, show access denied
  if (!isDealer) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center max-w-md p-8'>
          <h1 className={`${ui.text.h3} mb-4`}>
            {t('dealer.accessRequired', 'Dealer Access Required')}
          </h1>
          <p className='text-muted-foreground mb-6'>
            {t(
              'dealer.accessRequiredDescription',
              'You need to own a Dealer NFT to access this page. Purchase a Dealer NFT to create and manage prediction markets.'
            )}
          </p>
          <a
            href={`/${lang || 'en'}/become-dealer`}
            className='inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors'
          >
            {t('dealer.getDealerNft', 'Get Dealer NFT')}
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
