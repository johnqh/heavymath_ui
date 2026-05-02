/**
 * App configuration interface that consuming apps must provide.
 * This decouples the UI library from specific app configs.
 */
export interface HeavymathAppConfig {
  name: string;
  indexerUrl: string;
  websocketUrl?: string;
  defaultChainId: number;
  alchemyApiKey?: string;
  walletConnectProjectId?: string;
  devMode?: boolean;
  testMode?: boolean;
}

let _appConfig: HeavymathAppConfig | null = null;

/**
 * Initialize the app config. Must be called before using any components
 * that depend on config (contexts, hooks, etc.).
 */
export function initHeavymathUI(config: HeavymathAppConfig): void {
  _appConfig = config;
}

/**
 * Get the current app config. Throws if not initialized.
 */
export function getAppConfig(): HeavymathAppConfig {
  if (!_appConfig) {
    throw new Error(
      'heavymath_ui not initialized. Call initHeavymathUI() first.'
    );
  }
  return _appConfig;
}
