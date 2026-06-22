import React, { useEffect, useState } from 'react';
import { useTranslations } from 'use-intl';

import Field from './Field';
import AppSelect from './AppSelect';
import DateField from './DateField';
import SubscriptionIcon from './SubscriptionIcon';
import { getCurrencies, getCategories, getPaymentMethods } from '../api';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Alert, AlertText } from '@/components/ui/alert';

const BILLING_CYCLES = ['MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY'];
const STATUSES = ['ACTIVE', 'TRIAL', 'PAUSED', 'CANCELLED'];

export const EMPTY_SUBSCRIPTION = {
  name: '',
  url: '',
  logoUrl: '',
  amount: '',
  currency: 'USD',
  billingCycle: 'MONTHLY',
  status: 'ACTIVE',
  notes: '',
  startDate: '',
  nextBillingDate: '',
  categories: [],
  paymentMethodId: '',
};

export default function SubscriptionForm({ initial, submitting, error, submitLabel, onSubmit }) {
  const t = useTranslations('Subscription');
  const tCycle = useTranslations('BillingCycle');
  const tStatus = useTranslations('Status');

  const [form, setForm] = useState({ ...EMPTY_SUBSCRIPTION, ...initial });
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    Promise.all([getCurrencies(), getCategories(), getPaymentMethods()])
      .then(([currRes, catRes, pmRes]) => {
        setCurrencies(currRes.currencies || []);
        setCategories(catRes.categories || []);
        setPaymentMethods(pmRes.paymentMethods || []);
      })
      .catch(() => {});
  }, []);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const toggleCategory = (catId) =>
    setForm((p) => ({
      ...p,
      categories: p.categories.includes(catId)
        ? p.categories.filter((id) => id !== catId)
        : [...p.categories, catId],
    }));

  const handleSubmit = () => {
    setLocalError(null);
    if (!form.name || !form.amount) {
      setLocalError(t('nameAndAmountRequired'));
      return;
    }
    onSubmit({
      name: form.name,
      amount: Number(form.amount),
      currency: form.currency,
      billingCycle: form.billingCycle,
      status: form.status,
      url: form.url || undefined,
      logoUrl: form.logoUrl || undefined,
      notes: form.notes || undefined,
      startDate: form.startDate || undefined,
      nextBillingDate: form.nextBillingDate || undefined,
      categories: form.categories.length ? form.categories : undefined,
      paymentMethodId: form.paymentMethodId || undefined,
    });
  };

  const shownError = error || localError;

  const NONE = '__none__';
  const pmOptions = [
    { label: t('noPaymentMethod'), value: NONE },
    ...paymentMethods.map((pm) => ({ label: pm.name, value: pm.id })),
  ];

  return (
    <VStack space="lg">
      {!!shownError && (
        <Alert action="error" variant="outline">
          <AlertText>{shownError}</AlertText>
        </Alert>
      )}

      <Field label={`${t('name')} *`}>
        <Input>
          <InputField value={form.name} onChangeText={(v) => set('name', v)} placeholder={t('namePlaceholder')} />
        </Input>
      </Field>

      <Field label={t('url')}>
        <Input>
          <InputField
            value={form.url}
            onChangeText={(v) => set('url', v)}
            placeholder={t('urlPlaceholder')}
            autoCapitalize="none"
            keyboardType="url"
          />
        </Input>
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
          <SubscriptionIcon subscription={{ ...form, name: form.name || '?' }} size={40} />
        </HStack>
      </Field>

      <Field label={`${t('amount')} *`}>
        <Input>
          <InputField
            value={String(form.amount)}
            onChangeText={(v) => set('amount', v)}
            placeholder={t('amountPlaceholder')}
            keyboardType="decimal-pad"
          />
        </Input>
      </Field>

      <Field label={t('currency')}>
        <AppSelect
          value={form.currency}
          onValueChange={(v) => set('currency', v)}
          placeholder={t('selectCurrency')}
          options={currencies.map((c) => ({ label: `${c.code} — ${c.name}`, value: c.code }))}
        />
      </Field>

      <Field label={t('billingCycle')}>
        <AppSelect
          value={form.billingCycle}
          onValueChange={(v) => set('billingCycle', v)}
          placeholder={t('selectBillingCycle')}
          options={BILLING_CYCLES.map((c) => ({ label: tCycle(c), value: c }))}
        />
      </Field>

      <Field label={t('status')}>
        <AppSelect
          value={form.status}
          onValueChange={(v) => set('status', v)}
          placeholder={t('selectStatus')}
          options={STATUSES.map((s) => ({ label: tStatus(s), value: s }))}
        />
      </Field>

      <Field label={t('startDate')}>
        <DateField
          value={form.startDate}
          onChange={(v) => set('startDate', v)}
          placeholder={t('startDate')}
        />
      </Field>
      <Field label={t('nextBillingDate')}>
        <DateField
          value={form.nextBillingDate}
          onChange={(v) => set('nextBillingDate', v)}
          placeholder={t('nextBillingDate')}
        />
      </Field>

      {paymentMethods.length > 0 && (
        <Field label={t('paymentMethod')}>
          <AppSelect
            value={form.paymentMethodId || NONE}
            onValueChange={(v) => set('paymentMethodId', v === NONE ? '' : v)}
            options={pmOptions}
          />
        </Field>
      )}

      <Field label={t('categories')}>
        {categories.length === 0 ? (
          <Text className="text-xs text-typography-400">{t('noCategoriesYet')}</Text>
        ) : (
          <HStack space="sm" className="flex-wrap">
            {categories.map((cat) => {
              const selected = form.categories.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => toggleCategory(cat.id)}
                  className={`px-3 py-1 rounded-full border ${
                    selected ? 'bg-primary-600 border-primary-600' : 'bg-background-0 border-outline-200'
                  }`}
                >
                  <Text className={`text-xs font-medium ${selected ? 'text-typography-0' : 'text-typography-600'}`}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        )}
      </Field>

      <Field label={t('notes')}>
        <Textarea>
          <TextareaInput
            value={form.notes}
            onChangeText={(v) => set('notes', v)}
            placeholder={t('notesPlaceholder')}
          />
        </Textarea>
      </Field>

      <Button onPress={handleSubmit} isDisabled={submitting}>
        {submitting && <ButtonSpinner className="mr-2" />}
        <ButtonText>{submitLabel}</ButtonText>
      </Button>
    </VStack>
  );
}
