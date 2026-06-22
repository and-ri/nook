import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslations } from 'use-intl';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import SubscriptionForm from '../components/SubscriptionForm';
import { Spinner } from '@/components/ui/spinner';
import { getSubscription, updateSubscription } from '../api';
import { toDateInput } from '../lib/format';

export default function EditSubscriptionScreen({ route, navigation }) {
  const { id } = route.params;
  const t = useTranslations('Subscription');
  const [initial, setInitial] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSubscription(id)
      .then((res) => {
        const s = res.subscription || res;
        setInitial({
          name: s.name ?? '',
          url: s.url ?? '',
          logoUrl: s.logoUrl ?? '',
          amount: s.amount != null ? String(s.amount) : '',
          currency: s.currency ?? 'USD',
          billingCycle: s.billingCycle ?? 'MONTHLY',
          status: s.status ?? 'ACTIVE',
          notes: s.notes ?? '',
          startDate: toDateInput(s.startDate),
          nextBillingDate: toDateInput(s.nextBillingDate),
          categories: (s.categories || []).map((c) => c.id),
          paymentMethodId: s.paymentMethodId || s.paymentMethod?.id || '',
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const handleSubmit = async (payload) => {
    setError(null);
    setSubmitting(true);
    try {
      await updateSubscription(id, payload);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={t('edit')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          {initial ? (
            <SubscriptionForm
              initial={initial}
              submitting={submitting}
              error={error}
              submitLabel={submitting ? t('saving') : t('saveButton')}
              onSubmit={handleSubmit}
            />
          ) : (
            <Spinner size="large" className="mt-12" />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
