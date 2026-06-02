import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/WalletAuthContext';
import { ui } from '@sudobility/design';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

interface DealerRouteProps {
  children: React.ReactNode;
}

export function DealerRoute({ children }: DealerRouteProps) {
  const { lang } = useParams<{ lang: string }>();
  const text = useHeavymathUiText();
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
            {text('dealer.accessRequired')}
          </h1>
          <p className='text-muted-foreground mb-6'>
            {text('dealer.accessRequiredDescription')}
          </p>
          <a
            href={`/${lang || 'en'}/become-dealer`}
            className='inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors'
          >
            {text('dealer.getDealerNft')}
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
