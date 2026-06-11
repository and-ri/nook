'use client';

import Link from 'next/link';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSubscription, getCurrencies, getCategories, getPaymentMethods } from "@/lib/api";
import { SubscriptionIcon } from "@/components/ui/SubscriptionIcon";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const BILLING_CYCLES = ['MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY'];
const STATUSES = ['ACTIVE', 'TRIAL', 'PAUSED'];

export default function NewSubscriptionPage() {
    const t = useTranslations('Subscription');
    const tCommon = useTranslations('Common');
    const tCycle = useTranslations('BillingCycle');
    const tStatus = useTranslations('Status');
    const router = useRouter();

    const [formData, setFormData] = useState({
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
    });
    const [currencies, setCurrencies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([getCurrencies(), getCategories(), getPaymentMethods()])
            .then(([currRes, catRes, pmRes]) => {
                setCurrencies(currRes.currencies || []);
                setCategories(catRes.categories || catRes || []);
                setPaymentMethods(pmRes.paymentMethods || pmRes || []);
            })
            .catch(() => {});
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleCategory = (catId) => {
        setFormData(prev => {
            const cats = prev.categories || [];
            return {
                ...prev,
                categories: cats.includes(catId)
                    ? cats.filter(id => id !== catId)
                    : [...cats, catId],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.name || !formData.amount) {
            setError(t('nameAndAmountRequired'));
            return;
        }
        setLoading(true);
        try {
            const payload = {
                name:            formData.name,
                amount:          Number(formData.amount),
                currency:        formData.currency,
                billingCycle:    formData.billingCycle,
                status:          formData.status,
                url:             formData.url || undefined,
                logoUrl:         formData.logoUrl || undefined,
                notes:           formData.notes || undefined,
                startDate:       formData.startDate || undefined,
                nextBillingDate: formData.nextBillingDate || undefined,
                categories:      formData.categories.length ? formData.categories : undefined,
                paymentMethodId: formData.paymentMethodId || undefined,
            };
            await createSubscription(payload);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-lg flex flex-col gap-6">
            <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
                <Link href="/dashboard">
                    <ArrowLeft data-icon="inline-start" />
                    {t('backToList')}
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>{t('new')}</CardTitle>
                    <CardDescription>{t('newDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle />
                                <AlertTitle>{tCommon('error')}</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">{t('name')} *</FieldLabel>
                                <Input
                                    id="name" name="name" type="text"
                                    value={formData.name} onChange={handleChange}
                                    placeholder={t('namePlaceholder')} required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="url">{t('url')}</FieldLabel>
                                <Input
                                    id="url" name="url" type="url"
                                    value={formData.url} onChange={handleChange}
                                    placeholder={t('urlPlaceholder')}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="logoUrl">{t('logoUrl')}</FieldLabel>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="logoUrl" name="logoUrl" type="url"
                                        value={formData.logoUrl} onChange={handleChange}
                                        placeholder={t('logoUrlPlaceholder')}
                                        className="flex-1"
                                    />
                                    <SubscriptionIcon
                                        subscription={{ ...formData, name: formData.name || '?' }}
                                        size={36}
                                    />
                                </div>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="amount">{t('amount')} *</FieldLabel>
                                <Input
                                    id="amount" name="amount" type="number"
                                    min="0" step="0.01"
                                    value={formData.amount} onChange={handleChange}
                                    placeholder={t('amountPlaceholder')} required
                                />
                            </Field>

                            <Field>
                                <FieldLabel>{t('currency')}</FieldLabel>
                                <Select
                                    defaultValue={formData.currency}
                                    onValueChange={v => setFormData(p => ({ ...p, currency: v }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('selectCurrency')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {currencies.map(c => (
                                                <SelectItem key={c.code} value={c.code}>
                                                    {c.code} — {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel>{t('billingCycle')}</FieldLabel>
                                <Select
                                    defaultValue={formData.billingCycle}
                                    onValueChange={v => setFormData(p => ({ ...p, billingCycle: v }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('selectBillingCycle')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {BILLING_CYCLES.map(c => (
                                                <SelectItem key={c} value={c}>{tCycle(c)}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel>{t('status')}</FieldLabel>
                                <Select
                                    defaultValue={formData.status}
                                    onValueChange={v => setFormData(p => ({ ...p, status: v }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('selectStatus')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {STATUSES.map(s => (
                                                <SelectItem key={s} value={s}>{tStatus(s)}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="startDate">{t('startDate')}</FieldLabel>
                                    <Input
                                        id="startDate" name="startDate" type="date"
                                        value={formData.startDate} onChange={handleChange}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="nextBillingDate">{t('nextBillingDate')}</FieldLabel>
                                    <Input
                                        id="nextBillingDate" name="nextBillingDate" type="date"
                                        value={formData.nextBillingDate} onChange={handleChange}
                                    />
                                </Field>
                            </div>

                            {paymentMethods.length > 0 && (
                                <Field>
                                    <FieldLabel>{t('paymentMethod')}</FieldLabel>
                                    <Select
                                        defaultValue="__none__"
                                        onValueChange={v => setFormData(p => ({ ...p, paymentMethodId: v === '__none__' ? '' : v }))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="__none__">{t('noPaymentMethod')}</SelectItem>
                                                {paymentMethods.map(pm => (
                                                    <SelectItem key={pm.id} value={pm.id}>
                                                        <span className="flex items-center gap-2">
                                                            <SubscriptionIcon subscription={{ logoUrl: pm.logoUrl, name: pm.name }} size={16} />
                                                            {pm.name}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}

                            <Field>
                                <FieldLabel>{t('categories')}</FieldLabel>
                                {categories.length === 0 ? (
                                    <p className="text-xs text-muted-foreground pt-1">
                                        {t('noCategoriesYet')}{' '}
                                        <Link href="/dashboard/categories" className="underline hover:text-foreground">
                                            Create one →
                                        </Link>
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {categories.map(cat => {
                                            const selected = formData.categories.includes(cat.id);
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => toggleCategory(cat.id)}
                                                    className={cn(
                                                        'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                                                        selected
                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                            : 'bg-background text-muted-foreground border-border hover:bg-accent'
                                                    )}
                                                >
                                                    {cat.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="notes">{t('notes')}</FieldLabel>
                                <Textarea
                                    id="notes" name="notes"
                                    value={formData.notes} onChange={handleChange}
                                    placeholder={t('notesPlaceholder')} rows={3}
                                />
                            </Field>
                        </FieldGroup>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? t('creating') : t('createButton')}
                            </Button>
                            <Button
                                type="button" variant="outline"
                                onClick={() => router.push('/dashboard')}
                                disabled={loading}
                            >
                                {tCommon('cancel')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
