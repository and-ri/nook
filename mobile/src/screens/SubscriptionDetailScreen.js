import React, { useCallback, useState } from 'react';
import { Alert as RNAlert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslations, useLocale } from 'use-intl';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import SubscriptionIcon from '../components/SubscriptionIcon';
import StatusBadge from '../components/StatusBadge';
import { getSubscription, deleteSubscription } from '../api';
import { formatAmount, formatDate } from '../lib/format';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { Badge, BadgeText } from '@/components/ui/badge';

function DetailRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <HStack space="md" className="items-start py-3 border-b border-outline-100">
      <Box className="w-8 h-8 rounded-full bg-background-100 items-center justify-center mt-0.5">
        <Ionicons name={icon} size={16} color="#737373" />
      </Box>
      <VStack className="flex-1">
        <Text className="text-xs text-typography-400">{label}</Text>
        <Text className="text-typography-900 text-sm">{value}</Text>
      </VStack>
    </HStack>
  );
}

export default function SubscriptionDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const t = useTranslations('Subscription');
  const tCycle = useTranslations('BillingCycle');
  const tCommon = useTranslations('Common');
  const locale = useLocale();

  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getSubscription(id)
        .then((res) => setSub(res.subscription || res))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [id])
  );

  const confirmDelete = () => {
    RNAlert.alert(t('deleteTitle'), t('deleteDesc', { name: sub.name }), [
      { text: tCommon('cancel'), style: 'cancel' },
      {
        text: tCommon('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubscription(id);
            navigation.goBack();
          } catch (err) {
            RNAlert.alert(tCommon('error'), err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <Spinner size="large" />
      </Screen>
    );
  }

  if (!sub) {
    return (
      <Screen>
        <ScreenHeader title="" onBack={() => navigation.goBack()} />
        <Box className="flex-1 items-center justify-center">
          <Text className="text-typography-500">{t('backToList')}</Text>
        </Box>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title={sub.name}
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={() => navigation.navigate('EditSubscription', { id })} className="p-1">
            <Ionicons name="create-outline" size={24} color="#737373" />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <VStack className="items-center mb-6" space="sm">
          <SubscriptionIcon subscription={sub} size={72} />
          <Heading size="xl">{sub.name}</Heading>
          <StatusBadge status={sub.status} />
        </VStack>

        <Box className="bg-background-100 rounded-2xl p-5 mb-5 items-center">
          <Heading size="3xl" className="text-primary-600">
            {formatAmount(sub.amount, sub.currency, locale)}
          </Heading>
          <Text className="text-typography-500 text-sm">{tCycle(sub.billingCycle)}</Text>
        </Box>

        <Box className="border border-outline-100 rounded-2xl px-4">
          <DetailRow icon="calendar-outline" label={t('startDate')} value={formatDate(sub.startDate, locale)} />
          <DetailRow icon="refresh-outline" label={t('nextBillingDate')} value={formatDate(sub.nextBillingDate, locale)} />
          <DetailRow icon="ban-outline" label={t('cancelledAt')} value={formatDate(sub.cancelledAt, locale)} />
          <DetailRow icon="card-outline" label={t('paymentMethod')} value={sub.paymentMethod?.name} />
          <DetailRow icon="link-outline" label={t('website')} value={sub.url} />
          <DetailRow icon="document-text-outline" label={t('notes')} value={sub.notes} />
        </Box>

        {sub.categories?.length > 0 && (
          <VStack space="sm" className="mt-5">
            <Text className="text-xs text-typography-400 uppercase">{t('categories')}</Text>
            <HStack space="sm" className="flex-wrap">
              {sub.categories.map((cat) => (
                <Badge key={cat.id} action="muted" variant="outline" className="rounded-full">
                  <BadgeText>{cat.name}</BadgeText>
                </Badge>
              ))}
            </HStack>
          </VStack>
        )}

        <Button action="negative" variant="outline" className="mt-8" onPress={confirmDelete}>
          <ButtonText>{t('deleteTitle')}</ButtonText>
        </Button>
      </ScrollView>
    </Screen>
  );
}
