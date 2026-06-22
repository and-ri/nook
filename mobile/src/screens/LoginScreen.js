import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslations } from 'use-intl';

import Screen from '../components/Screen';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Alert, AlertText } from '@/components/ui/alert';
import { Pressable } from '@/components/ui/pressable';

export default function LoginScreen({ navigation }) {
  const t = useTranslations('Auth');
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError(t('fillAllFields'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space="2xl">
            <VStack space="xs">
              <Heading size="2xl">{t('loginTitle')}</Heading>
              <Text className="text-typography-500">{t('loginDescription')}</Text>
            </VStack>

            {!!error && (
              <Alert action="error" variant="outline">
                <AlertText>{error}</AlertText>
              </Alert>
            )}

            <VStack space="lg">
              <Field label={t('email')}>
                <Input>
                  <InputField
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                </Input>
              </Field>

              <Field label={t('password')}>
                <Input>
                  <InputField
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </Input>
              </Field>
            </VStack>

            <Button onPress={handleLogin} isDisabled={loading}>
              {loading && <ButtonSpinner className="mr-2" />}
              <ButtonText>{loading ? t('loggingIn') : t('login')}</ButtonText>
            </Button>

            <VStack space="sm" className="items-center">
              <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                <Text className="text-typography-500">{t('forgotPassword')}</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary-600 font-medium">{t('noAccount')}</Text>
              </Pressable>
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
