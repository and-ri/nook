import React, { useState } from 'react';
import { useTranslations, useLocale } from 'use-intl';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';

import { formatDate } from '../lib/format';
import { useTheme } from '../context/ThemeContext';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';

// A date input that displays the value in a styled trigger (matching gluestack
// Input) and opens a themed calendar in a bottom sheet. Values are exchanged as
// 'YYYY-MM-DD' strings — the format the API expects.
export default function DateField({ value, onChange, placeholder }) {
  const t = useTranslations('Common');
  const locale = useLocale();
  const { scheme } = useTheme();
  const pickerStyles = useDefaultStyles(scheme === 'dark' ? 'dark' : 'light');

  const [open, setOpen] = useState(false);

  const display = value ? formatDate(value, locale) : null;
  const tint = scheme === 'dark' ? '#a3a3a3' : '#737373';

  const pick = (date) => {
    onChange(dayjs(date).format('YYYY-MM-DD'));
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-10 px-3 rounded border border-outline-200 bg-background-0 flex-row items-center justify-between"
      >
        <Text className={display ? 'text-typography-900' : 'text-typography-400'}>
          {display || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={tint} />
      </Pressable>

      <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Box className="w-full px-2 pb-4">
            <DateTimePicker
              mode="single"
              date={value ? dayjs(value) : undefined}
              onChange={({ date }) => pick(date)}
              locale={locale}
              styles={pickerStyles}
            />
            <HStack className="justify-end mt-2">
              <Button variant="outline" action="secondary" size="sm" onPress={clear}>
                <ButtonText>{t('clear')}</ButtonText>
              </Button>
            </HStack>
          </Box>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
