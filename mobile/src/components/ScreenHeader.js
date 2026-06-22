import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Pressable } from '@/components/ui/pressable';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Title bar for stacked screens: optional back chevron, title, optional
// right-hand action. Tint follows the active colour scheme.
export default function ScreenHeader({ title, onBack, right }) {
  const { scheme } = useTheme();
  const tint = scheme === 'dark' ? '#e5e5e5' : '#171717';

  return (
    <HStack className="items-center px-4 py-3 border-b border-outline-100" space="sm">
      {onBack && (
        <Pressable onPress={onBack} className="p-1 -ml-1">
          <Ionicons name="arrow-back" size={24} color={tint} />
        </Pressable>
      )}
      <Heading size="lg" className="flex-1" numberOfLines={1}>
        {title}
      </Heading>
      {right}
    </HStack>
  );
}
