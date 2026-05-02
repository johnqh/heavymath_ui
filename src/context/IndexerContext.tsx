/**
 * @fileoverview Indexer Context Provider
 * @description Provides a singleton IndexerClient instance to the React component tree.
 * Always use the `useIndexer()` hook to access the client rather than constructing one directly.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { webNetworkClient } from '@sudobility/di';
import { IndexerClient } from '@heavymath/indexer_client';
import { getAppConfig } from '../config/app';

/** Shape of the IndexerContext value */
interface IndexerContextType {
  /** The shared IndexerClient instance for API communication */
  indexerClient: IndexerClient;
}

const IndexerContext = createContext<IndexerContextType | undefined>(undefined);

/** Props for the IndexerProvider component */
interface IndexerProviderProps {
  children: ReactNode;
}

/**
 * Provides a memoized IndexerClient instance to descendant components.
 * Must be placed inside SudobilityApp (which provides the DI network client).
 *
 * @param props - Component props containing children
 * @returns The provider wrapping children with IndexerClient access
 */
export function IndexerProvider({ children }: IndexerProviderProps) {
  const indexerClient = useMemo(
    () => new IndexerClient(getAppConfig().indexerUrl, webNetworkClient),
    []
  );

  const value: IndexerContextType = {
    indexerClient,
  };

  return (
    <IndexerContext.Provider value={value}>{children}</IndexerContext.Provider>
  );
}

/**
 * Hook to access the IndexerClient from context.
 * Must be used within an IndexerProvider.
 *
 * @returns Object containing the shared indexerClient instance
 * @throws Error if used outside of IndexerProvider
 */
export function useIndexer() {
  const context = useContext(IndexerContext);
  if (context === undefined) {
    throw new Error('useIndexer must be used within an IndexerProvider');
  }
  return context;
}
