import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslations, useLocale } from 'use-intl';

import Screen from '../components/Screen';
import StatusBadge from '../components/StatusBadge';
import { getSubscriptions, getStats } from '../api';
import { formatAmount, formatDate } from '../lib/format';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertText } from '@/components/ui/alert';

const BAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#14b8a6'];

function SummaryCard({ label, value }) {
  return (
    <Box className="bg-background-100 rounded-2xl p-4 flex-1 min-w-[45%]">
      <Text className="text-xs text-typography-500">{label}</Text>
      <Heading size="lg">{value}</Heading>
    </Box>
  );
}

function SectionCard({ title, children }) {
  return (
    <VStack space="md" className="bg-background-50 border border-outline-100 rounded-2xl p-4">
      <Text className="font-semibold text-typography-900">{title}</Text>
      {children}
    </VStack>
  );
}

function Bar({ label, value, max, currency, locale, color }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <VStack space="xs">
      <HStack className="justify-between">
        <Text className="text-sm text-typography-700" numberOfLines={1}>{label}</Text>
        <Text className="text-sm text-typography-500">{formatAmount(value, currency, locale)}</Text>
      </HStack>
      <Box className="h-2 rounded-full bg-background-200">
        <Box className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </Box>
    </VStack>
  );
}

export default function ReportsScreen() {
  const t = useTranslations('Reports');
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([getSubscriptions(), getStats()])
        .then(([s, st]) => {
          setSubs(s.subscriptions || []);
          setStats(st);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <Spinner size="large" />
      </Screen>
    );
  }

  const currency = stats?.currency ?? 'USD';
  const monthlyOf = (s) => s.convertedMonthly ?? 0;

  const catMap = {};
  subs.forEach((s) => {
    if (!s.categories?.length) {
      catMap['—'] = (catMap['—'] ?? 0) + monthlyOf(s);
    } else {
      s.categories.forEach((c) => {
        catMap[c.name] = (catMap[c.name] ?? 0) + monthlyOf(s);
      });
    }
  });
  const catData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
  const catMax = Math.max(0, ...catData.map((d) => d.value));

  const statusEntries = Object.entries(stats?.subscriptionsByStatus ?? {});
  const upcoming = stats?.upcomingRenewals ?? [];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Heading size="2xl" className="mb-4">{t('title')}</Heading>

        {error ? (
          <Alert action="error" variant="outline">
            <AlertText>{error}</AlertText>
          </Alert>
        ) : (
          <VStack space="lg">
            <HStack space="md" className="flex-wrap">
              <SummaryCard label={t('totalMonthly')} value={formatAmount(stats?.totalMonthlySpend ?? 0, currency, locale)} />
              <SummaryCard label={t('totalYearly')} value={formatAmount(stats?.totalYearlySpend ?? 0, currency, locale)} />
              <SummaryCard label={t('totalActive')} value={stats?.totalSubscriptions ?? 0} />
              <SummaryCard label={t('total')} value={subs.length} />
            </HStack>

            <SectionCard title={t('byCategory')}>
              {catData.length === 0 ? (
                <Text className="text-sm text-typography-400">{t('noData')}</Text>
              ) : (
                catData.map((d, i) => (
                  <Bar
                    key={d.name}
                    label={d.name}
                    value={d.value}
                    max={catMax}
                    currency={currency}
                    locale={locale}
                    color={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))
              )}
            </SectionCard>

            <SectionCard title={t('byStatus')}>
              {statusEntries.length === 0 ? (
                <Text className="text-sm text-typography-400">{t('noData')}</Text>
              ) : (
                statusEntries.map(([status, count]) => (
                  <HStack key={status} className="justify-between items-center">
                    <StatusBadge status={status} />
                    <Text className="text-typography-700">{count}</Text>
                  </HStack>
                ))
              )}
            </SectionCard>

            <SectionCard title={t('upcoming')}>
              {upcoming.length === 0 ? (
                <Text className="text-sm text-typography-400">{t('noUpcoming')}</Text>
              ) : (
                upcoming.map((s) => (
                  <HStack key={s.id} className="justify-between items-center">
                    <Text className="text-typography-700 flex-1 mr-2" numberOfLines={1}>{s.name}</Text>
                    <Text className="text-typography-500 text-sm">{formatDate(s.nextBillingDate, locale)}</Text>
                  </HStack>
                ))
              )}
            </SectionCard>
          </VStack>
        )}
      </ScrollView>
    </Screen>
  );
}
