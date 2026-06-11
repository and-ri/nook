'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { SubscriptionIcon } from '@/components/ui/SubscriptionIcon';
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '@/lib/api';
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';

const TYPES = ['card', 'bank', 'wallet', 'crypto', 'other'];
const EMPTY_FORM = { name: '', type: 'card', logoUrl: '' };

function MethodForm({ initial = EMPTY_FORM, onSave, onCancel, saving, t }) {
    const [form, setForm] = useState(initial);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="pm-name">{t('name')} *</FieldLabel>
                    <Input
                        id="pm-name" name="name" value={form.name}
                        onChange={handleChange} placeholder={t('namePlaceholder')} required
                    />
                </Field>
                <Field>
                    <FieldLabel>{t('type')}</FieldLabel>
                    <Select
                        value={form.type}
                        onValueChange={v => setForm(p => ({ ...p, type: v }))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {TYPES.map(tp => (
                                    <SelectItem key={tp} value={tp}>{t(`types.${tp}`)}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="pm-logo">{t('logoUrl')}</FieldLabel>
                    <div className="flex items-center gap-2">
                        <Input
                            id="pm-logo" name="logoUrl" type="url" value={form.logoUrl}
                            onChange={handleChange} placeholder={t('logoUrlPlaceholder')}
                            className="flex-1"
                        />
                        <SubscriptionIcon subscription={{ logoUrl: form.logoUrl, name: form.name || '?' }} size={36} />
                    </div>
                </Field>
            </FieldGroup>
            <div className="flex gap-3">
                <Button type="submit" disabled={saving} size="sm" className="flex-1">
                    {saving ? t('saving') : t('saveButton')}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default function PaymentMethodsPage() {
    const t = useTranslations('PaymentMethod');
    const tCommon = useTranslations('Common');

    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAdd, setShowAdd] = useState(false);
    const [addSaving, setAddSaving] = useState(false);
    const [addError, setAddError] = useState(null);

    const [editId, setEditId] = useState(null);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState(null);

    const reload = () => {
        setLoading(true);
        getPaymentMethods()
            .then(res => setMethods(res.paymentMethods || res || []))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { reload(); }, []);

    const handleAdd = async (form) => {
        setAddError(null);
        setAddSaving(true);
        try {
            await createPaymentMethod({
                name: form.name,
                type: form.type,
                logoUrl: form.logoUrl || undefined,
            });
            setShowAdd(false);
            reload();
        } catch (e) {
            setAddError(e.message);
        } finally {
            setAddSaving(false);
        }
    };

    const handleEdit = async (form) => {
        setEditError(null);
        setEditSaving(true);
        try {
            await updatePaymentMethod(editId, {
                name: form.name,
                type: form.type,
                logoUrl: form.logoUrl || undefined,
            });
            setEditId(null);
            reload();
        } catch (e) {
            setEditError(e.message);
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deletePaymentMethod(id);
            reload();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
                </div>
                {!showAdd && (
                    <Button size="sm" onClick={() => setShowAdd(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('add')}
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Add form */}
            {showAdd && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('addTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {addError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{addError}</AlertDescription>
                            </Alert>
                        )}
                        <MethodForm
                            onSave={handleAdd}
                            onCancel={() => { setShowAdd(false); setAddError(null); }}
                            saving={addSaving}
                            t={t}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Methods list */}
            {loading ? (
                <Card>
                    <CardContent className="py-4 flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="flex-1 flex flex-col gap-1">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : methods.length === 0 ? (
                <Card>
                    <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                        <CreditCard className="h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium">{t('noMethods')}</p>
                        <p className="text-sm text-muted-foreground">{t('noMethodsDesc')}</p>
                        {!showAdd && (
                            <Button size="sm" className="mt-2" onClick={() => setShowAdd(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('add')}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        {methods.map((pm, idx) => (
                            <div key={pm.id}>
                                {idx > 0 && <Separator />}
                                {editId === pm.id ? (
                                    <div className="p-4">
                                        <p className="text-sm font-medium mb-4">{t('editTitle')}</p>
                                        {editError && (
                                            <Alert variant="destructive" className="mb-4">
                                                <AlertDescription>{editError}</AlertDescription>
                                            </Alert>
                                        )}
                                        <MethodForm
                                            initial={{ name: pm.name, type: pm.type, logoUrl: pm.logoUrl || '' }}
                                            onSave={handleEdit}
                                            onCancel={() => { setEditId(null); setEditError(null); }}
                                            saving={editSaving}
                                            t={t}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <SubscriptionIcon
                                            subscription={{ logoUrl: pm.logoUrl, name: pm.name }}
                                            size={36}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{pm.name}</p>
                                            <p className="text-xs text-muted-foreground">{t(`types.${pm.type}`)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost" size="icon"
                                                onClick={() => { setEditId(pm.id); setEditError(null); }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t('deleteDesc', { name: pm.name })}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            variant="destructive"
                                                            onClick={() => handleDelete(pm.id)}
                                                        >
                                                            {tCommon('delete')}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
