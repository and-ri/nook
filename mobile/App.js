import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { LocaleProvider } from '@/src/context/LocaleContext';
import { AuthProvider } from '@/src/context/AuthContext';
import RootNavigator from '@/src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* ThemeProvider renders GluestackUIProvider (Overlay + Toast) internally. */}
      <ThemeProvider>
        <LocaleProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
