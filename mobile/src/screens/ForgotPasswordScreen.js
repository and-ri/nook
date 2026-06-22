import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslations } from 'use-intl';

import Screen from '../components/Screen';
import Field from '../components/Field';
import { forgotPassword } from '../api';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Alert, AlertText } from '@/components/ui/alert';
import { Pressable } from '@/components/ui/pressable';

export default function ForgotPasswordScreen({ navigation }) {
  const t = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError(t('emailRequired'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {sent ? (
            <VStack space="lg">
              <Alert action="success" variant="outline">
                <AlertText>{t('forgotSentDescription')}</AlertText>
              </Alert>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text className="text-center text-primary-600 font-medium">{t('backToLogin')}</Text>
              </Pressable>
            </VStack>
          ) : (
            <VStack space="2xl">
              <VStack space="xs">
                <Heading size="2xl">{t('forgotTitle')}</Heading>
                <Text className="text-typography-500">{t('forgotDescription')}</Text>
              </VStack>

              {!!error && (
                <Alert action="error" variant="outline">
                  <AlertText>{error}</AlertText>
                </Alert>
              )}

              <Field label={t('email')}>
                <Input>
                  <InputField
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    onSubmitEditing={handleSubmit}
                  />
                </Input>
              </Field>

              <Button onPress={handleSubmit} isDisabled={loading}>
                {loading && <ButtonSpinner className="mr-2" />}
                <ButtonText>{loading ? t('sending') : t('sendResetLink')}</ButtonText>
              </Button>

              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text className="text-center text-typography-500">{t('backToLogin')}</Text>
              </Pressable>
            </VStack>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
