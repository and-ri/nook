import React from 'react';
import { useTranslations } from 'use-intl';
import { Badge, BadgeText } from '@/components/ui/badge';

// Maps a subscription status to a gluestack Badge action (which drives colour).
const ACTION = {
  ACTIVE: 'success',
  TRIAL: 'info',
  PAUSED: 'warning',
  CANCELLED: 'error',
};

export default function StatusBadge({ status }) {
  const t = useTranslations('Status');
  return (
    <Badge action={ACTION[status] || 'muted'} variant="solid" size="sm" className="rounded-full">
      <BadgeText className="capitalize">{t(status)}</BadgeText>
    </Badge>
  );
}
