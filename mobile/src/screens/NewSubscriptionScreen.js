import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslations } from 'use-intl';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import SubscriptionForm from '../components/SubscriptionForm';
import { createSubscription } from '../api';

export default function NewSubscriptionScreen({ navigation }) {
  const t = useTranslations('Subscription');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    setError(null);
    setSubmitting(true);
    try {
      await createSubscription(payload);
      navigation.navigate('Dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={t('new')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <SubscriptionForm
            submitting={submitting}
            error={error}
            submitLabel={submitting ? t('creating') : t('createButton')}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
