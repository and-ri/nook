import React from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectScrollView,
  SelectItem,
} from '@/components/ui/select';
import { ChevronDownIcon } from '@/components/ui/icon';

// Thin wrapper over gluestack's Select so screens don't repeat the
// portal/backdrop/actionsheet boilerplate. `options` is [{ label, value }].
export default function AppSelect({
  value,
  onValueChange,
  options,
  placeholder,
  isDisabled,
}) {
  const selected = options.find((o) => o.value === value);
  const { height } = useWindowDimensions();

  return (
    <Select selectedValue={value} onValueChange={onValueChange} isDisabled={isDisabled}>
      <SelectTrigger variant="outline" size="md" className="justify-between">
        <SelectInput placeholder={placeholder} value={selected?.label} />
        <SelectIcon className="mr-3" as={ChevronDownIcon} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        {/* Cap the sheet at 80% of the screen and scroll long lists (e.g.
            currencies) instead of overflowing past the top edge. */}
        <SelectContent style={{ maxHeight: height * 0.8 }}>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          <SelectScrollView className="w-full">
            {options.map((o) => (
              <SelectItem key={o.value} label={o.label} value={o.value} />
            ))}
          </SelectScrollView>
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}
