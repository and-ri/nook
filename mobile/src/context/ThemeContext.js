import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme as nwColorScheme } from 'nativewind';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { config } from '@/components/ui/gluestack-ui-provider/config';

const STORAGE_KEY = 'theme_mode';
const MODES = ['light', 'dark', 'system'];

const ThemeContext = createContext({
  mode: 'system',
  scheme: 'light',
  setMode: () => {},
});

// 'system' resolves to the live device scheme; everything else is literal.
function resolveScheme(mode) {
  if (mode === 'system') return Appearance.getColorScheme() || 'light';
  return mode;
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('system');
  const [scheme, setScheme] = useState(resolveScheme('system'));

  const apply = (next) => {
    setModeState(next);
    setScheme(resolveScheme(next));
    // Drive NativeWind imperatively so `dark:` variants and gluestack's own
    // internal components flip too (not just our explicit token vars below).
    nwColorScheme.set(next);
  };

  // Restore the saved mode, then keep 'system' in sync with the OS.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      apply(MODES.includes(saved) ? saved : 'system');
    });
    const sub = Appearance.addChangeListener(() => {
      setModeState((curr) => {
        if (curr === 'system') setScheme(resolveScheme('system'));
        return curr;
      });
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = (next) => {
    if (!MODES.includes(next)) return;
    apply(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ mode, scheme, setMode }}>
      {/* GluestackUIProvider supplies Overlay + Toast. The inner View applies
          the gluestack colour tokens for the scheme WE resolved, so theming
          never depends on the provider's internal color-scheme state. */}
      <GluestackUIProvider mode={mode}>
        <View style={[config[scheme], { flex: 1 }]}>{children}</View>
      </GluestackUIProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
