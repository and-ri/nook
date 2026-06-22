import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslations, useLocale } from 'use-intl';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import StatusBadge from '../components/StatusBadge';
import SubscriptionIcon from '../components/SubscriptionIcon';
import { getSubscriptions, getStats } from '../api';
import { formatAmount, formatDate, daysUntil } from '../lib/format';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import { Pressable } from '@/components/ui/pressable';
import { Fab, FabIcon } from '@/components/ui/fab';
import { AddIcon } from '@/components/ui/icon';
import { Alert, AlertText } from '@/components/ui/alert';

function StatCard({ label, value, sub, highlight }) {
  return (
    <Box
      className={`flex-1 rounded-2xl p-5 ${highlight ? 'bg-primary-600' : 'bg-background-100'}`}
    >
      <Text className={highlight ? 'text-primary-100 text-sm' : 'text-typography-500 text-sm'}>
        {label}
      </Text>
      <Heading size="xl" className={highlight ? 'text-typography-0' : 'text-typography-900'}>
        {value}
      </Heading>
      {!!sub && (
        <Text className={highlight ? 'text-primary-200 text-xs' : 'text-typography-400 text-xs'}>
          {sub}
        </Text>
      )}
    </Box>
  );
}

function SubscriptionCard({ item, onPress, locale, t, tCycle }) {
  const days = daysUntil(item.nextBillingDate);
  let dueLabel = null;
  if (item.nextBillingDate) {
    if (days < 0) dueLabel = t('overdue');
    else if (days === 0) dueLabel = t('dueToday');
    else if (days === 1) dueLabel = t('dueTomorrow');
    else dueLabel = t('dueOn', { date: formatDate(item.nextBillingDate, locale) });
  }

  return (
    <Pressable
      onPress={() => onPress(item)}
      className="bg-background-50 rounded-2xl p-4 mb-3 border border-outline-100"
    >
      <HStack space="md" className="items-center">
        <SubscriptionIcon subscription={item} size={44} />
        <VStack className="flex-1">
          <HStack className="items-center justify-between">
            <Text className="text-typography-900 font-semibold flex-1 mr-2" numberOfLines={1}>
              {item.name}
            </Text>
            <StatusBadge status={item.status} />
          </HStack>
          <Text className="text-typography-500 text-sm">
            {formatAmount(item.amount, item.currency, locale)}
            <Text className="text-typography-400">{tCycle(`suffix.${item.billingCycle}`)}</Text>
          </Text>
          {!!dueLabel && (
            <Text className={`text-xs ${days !== null && days <= 7 ? 'text-error-600' : 'text-typography-400'}`}>
              {dueLabel}
            </Text>
          )}
        </VStack>
        <Ionicons name="chevron-forward" size={16} color="#a3a3a3" />
      </HStack>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }) {
  const t = useTranslations('Dashboard');
  const tStats = useTranslations('Stats');
  const tStatus = useTranslations('Status');
  const tCycle = useTranslations('BillingCycle');
  const tCommon = useTranslations('Common');
  const locale = useLocale();

  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const STATUS_TABS = [
    { label: tCommon('all'), value: '' },
    { label: tStatus('ACTIVE'), value: 'ACTIVE' },
    { label: tStatus('TRIAL'), value: 'TRIAL' },
    { label: tStatus('PAUSED'), value: 'PAUSED' },
    { label: tStatus('CANCELLED'), value: 'CANCELLED' },
  ];

  const load = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const [subRes, statsRes] = await Promise.all([
          getSubscriptions(activeTab ? { status: activeTab } : {}),
          getStats(),
        ]);
        setSubscriptions(subRes.subscriptions || []);
        setStats(statsRes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab]
  );

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <Spinner size="large" />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <HStack className="items-center justify-between px-5 pt-4 pb-3">
        <Heading size="2xl">{t('title')}</Heading>
      </HStack>

      <HStack space="md" className="px-5 mb-4">
        <StatCard
          highlight
          label={tStats('monthlySpend')}
          value={stats ? formatAmount(stats.totalMonthlySpend, stats.currency, locale) : '—'}
          sub={stats?.currency}
        />
        <StatCard
          label={tStats('activeSubscriptions')}
          value={stats?.totalSubscriptions ?? '—'}
        />
      </HStack>

      <Box className="mb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {STATUS_TABS.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <Pressable
                key={tab.value || 'all'}
                onPress={() => setActiveTab(tab.value)}
                className={`rounded-full px-4 py-2 ${active ? 'bg-primary-600' : 'bg-background-100'}`}
              >
                <Text className={`text-sm font-medium ${active ? 'text-typography-0' : 'text-typography-600'}`}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Box>

      {!!error && (
        <Box className="mx-5 mb-3">
          <Alert action="error" variant="outline">
            <AlertText>{error}</AlertText>
          </Alert>
        </Box>
      )}

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        renderItem={({ item }) => (
          <SubscriptionCard
            item={item}
            locale={locale}
            t={t}
            tCycle={tCycle}
            onPress={(sub) => navigation.navigate('SubscriptionDetail', { id: sub.id })}
          />
        )}
        ListEmptyComponent={
          <VStack className="items-center justify-center py-20" space="md">
            <Ionicons name="receipt-outline" size={48} color="#a3a3a3" />
            <Text className="text-typography-400 text-center">{t('noSubscriptions')}</Text>
          </VStack>
        }
      />

      <Fab size="lg" onPress={() => navigation.navigate('NewSubscription')}>
        <FabIcon as={AddIcon} />
      </Fab>
    </Screen>
  );
}
