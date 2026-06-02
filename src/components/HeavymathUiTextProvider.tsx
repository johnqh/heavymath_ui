import { createContext, useContext, type ReactNode } from 'react';

export type HeavymathUiTextMap = Record<string, string>;

const HeavymathUiTextContext = createContext<HeavymathUiTextMap | null>(null);

export function HeavymathUiTextProvider({
  text,
  children,
}: {
  text: HeavymathUiTextMap;
  children: ReactNode;
}) {
  return (
    <HeavymathUiTextContext.Provider value={text}>
      {children}
    </HeavymathUiTextContext.Provider>
  );
}

export function useHeavymathUiText() {
  const text = useContext(HeavymathUiTextContext);
  if (!text) {
    throw new Error('HeavymathUiTextProvider is required');
  }

  return (key: string, values?: Record<string, string | number | bigint>) => {
    const template = text[key] ?? key;
    if (!values) return template;

    return Object.entries(values).reduce(
      (result, [name, value]) =>
        result.replace(new RegExp(`{{${name}}}`, 'g'), String(value)),
      template
    );
  };
}
