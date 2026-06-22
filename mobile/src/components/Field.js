import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';

// Label + control + optional error, mirroring the web app's <Field>.
export default function Field({ label, error, children }) {
  return (
    <VStack space="xs">
      {!!label && (
        <Text className="text-sm font-medium text-typography-700">{label}</Text>
      )}
      {children}
      {!!error && <Text className="text-xs text-error-600">{error}</Text>}
    </VStack>
  );
}
