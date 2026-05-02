import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/WalletAuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireDealer?: boolean;
}

export function ProtectedRoute({
  children,
  requireDealer = false,
}: ProtectedRouteProps) {
  const { lang } = useParams<{ lang: string }>();
  const { isConnected, isDealer } = useAuth();

  // Not connected - redirect to connect page
  if (!isConnected) {
    return <Navigate to={`/${lang}/connect`} replace />;
  }

  // Requires dealer but user is not a dealer
  if (requireDealer && !isDealer) {
    return <Navigate to={`/${lang}/become-dealer`} replace />;
  }

  return <>{children}</>;
}
