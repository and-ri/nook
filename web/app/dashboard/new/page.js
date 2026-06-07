'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/lib/api";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NewSubscriptionPage() {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        amount: '',
        currency: 'USD',
        billingCycle: 'MONTHLY',
        status: 'ACTIVE',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.name || !formData.amount) {
            setError('Name and amount are required.');
            return;
        }
        setLoading(true);
        try {
            await fetchApi('/subscriptions', {
                method: 'POST',
                body: { ...formData, amount: Number(formData.amount) },
            });
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto py-8 max-w-lg flex flex-col gap-6">
                    <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
                        <Link href="/dashboard">
                            <ArrowLeft data-icon="inline-start" />
                            Back to subscriptions
                        </Link>
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle>New Subscription</CardTitle>
                            <CardDescription>Fill in the details to track a new subscription.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="name">Name *</FieldLabel>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Netflix"
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="url">Website URL</FieldLabel>
                                        <Input
                                            id="url"
                                            name="url"
                                            type="url"
                                            value={formData.url}
                                            onChange={handleChange}
                                            placeholder="https://example.com"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="amount">Amount *</FieldLabel>
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Currency</FieldLabel>
                                        <Select
                                            name="currency"
                                            defaultValue={formData.currency}
                                            onValueChange={(v) => setFormData(p => ({ ...p, currency: v }))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                                                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                                                    <SelectItem value="UAH">UAH — Ukrainian Hryvnia</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Billing Cycle</FieldLabel>
                                        <Select
                                            name="billingCycle"
                                            defaultValue={formData.billingCycle}
                                            onValueChange={(v) => setFormData(p => ({ ...p, billingCycle: v }))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select billing cycle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                    <SelectItem value="DAILY">Daily</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Status</FieldLabel>
                                        <Select
                                            name="status"
                                            defaultValue={formData.status}
                                            onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                                    <SelectItem value="TRIAL">Trial</SelectItem>
                                                    <SelectItem value="PAUSED">Paused</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="notes">Notes</FieldLabel>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Optional notes about this subscription…"
                                            rows={3}
                                        />
                                    </Field>
                                </FieldGroup>
                                <div className="flex gap-3">
                                    <Button type="submit" disabled={loading} className="flex-1">
                                        {loading ? 'Creating…' : 'Create Subscription'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/dashboard')}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
