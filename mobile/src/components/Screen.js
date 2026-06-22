import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';

// SafeAreaView is a third-party component, so register it with NativeWind to
// guarantee `className` is converted to `style`.
cssInterop(SafeAreaView, { className: 'style' });

// Themed, safe-area-aware page wrapper. Uses gluestack's semantic background
// token so it adapts to light/dark automatically.
export default function Screen({ children, className = '', edges = ['top', 'bottom'] }) {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-background-0 ${className}`}>
      {children}
    </SafeAreaView>
  );
}
