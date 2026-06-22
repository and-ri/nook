import React, { useCallback, useState } from 'react';
import { Alert as RNAlert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslations } from 'use-intl';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import Field from '../components/Field';
import AppSelect from '../components/AppSelect';
import SubscriptionIcon from '../components/SubscriptionIcon';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '../api';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Alert, AlertText } from '@/components/ui/alert';
import { AddIcon } from '@/components/ui/icon';

const TYPES = ['card', 'bank', 'wallet', 'crypto', 'other'];
const EMPTY = { name: '', type: 'card', logoUrl: '' };

function MethodForm({ initial, onSave, onCancel, saving, t, tCommon }) {
  const [form, setForm] = useState(initial || EMPTY);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <VStack space="md" className="bg-background-50 border border-outline-100 rounded-2xl p-4">
      <Field label={`${t('name')} *`}>
        <Input>
          <InputField value={form.name} onChangeText={(v) => set('name', v)} placeholder={t('namePlaceholder')} />
        </Input>
      </Field>
      <Field label={t('type')}>
        <AppSelect
          value={form.type}
          onValueChange={(v) => set('type', v)}
          options={TYPES.map((tp) => ({ label: t(`types.${tp}`), value: tp }))}
        />
      </Field>
      <Field label={t('logoUrl')}>
        <HStack space="sm" className="items-center">
          <Input className="flex-1">
            <InputField
              value={form.logoUrl}
              onChangeText={(v) => set('logoUrl', v)}
              placeholder={t('logoUrlPlaceholder')}
              autoCapitalize="none"
              keyboardType="url"
            />
          </Input>
          <SubscriptionIcon subscription={{ logoUrl: form.logoUrl, name: form.name || '?' }} size={40} />
        </HStack>
      </Field>
      <HStack space="sm">
        <Button className="flex-1" isDisabled={saving || !form.name.trim()} onPress={() => onSave(form)}>
          <ButtonText>{saving ? t('saving') : t('saveButton')}</ButtonText>
        </Button>
        <Button variant="outline" action="secondary" onPress={onCancel}>
          <ButtonText>{tCommon('cancel')}</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}

export default function PaymentMethodsScreen({ navigation }) {
  const t = useTranslations('PaymentMethod');
  const tCommon = useTranslations('Common');

  const [methods, setMethods] = useState([]);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(() => {
    getPaymentMethods()
      .then((res) => setMethods(res.paymentMethods || []))
      .catch((e) => setError(e.message));
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const submit = async (form, id) => {
    setSaving(true);
    setError(null);
    try {
      const body = { name: form.name, type: form.type, logoUrl: form.logoUrl || undefined };
      if (id) await updatePaymentMethod(id, body);
      else await createPaymentMethod(body);
      setShowAdd(false);
      setEditId(null);
      reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (pm) => {
    RNAlert.alert(t('deleteTitle'), t('deleteDesc', { name: pm.name }), [
      { text: tCommon('cancel'), style: 'cancel' },
      {
        text: tCommon('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePaymentMethod(pm.id);
            reload();
          } catch (e) {
            setError(e.message);
          }
        },
      },
    ]);
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title={t('title')}
        onBack={() => navigation.goBack()}
        right={
          !showAdd && editId === null ? (
            <Pressable onPress={() => setShowAdd(true)} className="p-1">
              <Ionicons name="add" size={26} color="#737373" />
            </Pressable>
          ) : null
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <VStack space="md">
          <Text className="text-sm text-typography-500">{t('description')}</Text>

          {!!error && (
            <Alert action="error" variant="outline">
              <AlertText>{error}</AlertText>
            </Alert>
          )}

          {showAdd && (
            <MethodForm t={t} tCommon={tCommon} saving={saving} onSave={(f) => submit(f)} onCancel={() => setShowAdd(false)} />
          )}

          {methods.map((pm) =>
            editId === pm.id ? (
              <MethodForm
                key={pm.id}
                t={t}
                tCommon={tCommon}
                saving={saving}
                initial={{ name: pm.name, type: pm.type, logoUrl: pm.logoUrl || '' }}
                onSave={(f) => submit(f, pm.id)}
                onCancel={() => setEditId(null)}
              />
            ) : (
              <HStack key={pm.id} space="sm" className="items-center py-2 border-b border-outline-100">
                <SubscriptionIcon subscription={{ logoUrl: pm.logoUrl, name: pm.name }} size={36} />
                <VStack className="flex-1">
                  <Text className="text-typography-900">{pm.name}</Text>
                  <Text className="text-xs text-typography-400">{t(`types.${pm.type}`)}</Text>
                </VStack>
                <Pressable onPress={() => { setEditId(pm.id); setShowAdd(false); }} className="p-2">
                  <Ionicons name="create-outline" size={20} color="#737373" />
                </Pressable>
                <Pressable onPress={() => confirmDelete(pm)} className="p-2">
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </Pressable>
              </HStack>
            )
          )}

          {methods.length === 0 && !showAdd && (
            <Box className="items-center py-16">
              <Ionicons name="card-outline" size={40} color="#a3a3a3" />
              <Text className="text-typography-400 mt-3">{t('noMethods')}</Text>
              <Button className="mt-4" onPress={() => setShowAdd(true)}>
                <ButtonIcon as={AddIcon} className="mr-1" />
                <ButtonText>{t('add')}</ButtonText>
              </Button>
            </Box>
          )}
        </VStack>
      </ScrollView>
    </Screen>
  );
}
