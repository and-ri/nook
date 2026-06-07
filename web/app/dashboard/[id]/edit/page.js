'use client';

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/lib/api";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function SubscriptionEditPage({ params }) {
    const { id } = use(params);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSubscription = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchApi(`/subscriptions/${id}`);
                setFormData(response.subscription);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [id]);

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
        setSubmitting(true);
        try {
            await fetchApi(`/subscriptions/${id}`, {
                method: 'PATCH',
                body: { ...formData, amount: Number(formData.amount) },
            });
            router.push(`/dashboard/${id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto py-8 max-w-lg flex flex-col gap-6">
                    <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
                        <Link href={`/dashboard/${id}`}>
                            <ArrowLeft data-icon="inline-start" />
                            Back to subscription
                        </Link>
                    </Button>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {loading ? (
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </CardContent>
                        </Card>
                    ) : formData ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Subscription</CardTitle>
                                <CardDescription>Update the details for {formData.name}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="name">Name *</FieldLabel>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="url">Website URL</FieldLabel>
                                            <Input
                                                id="url"
                                                name="url"
                                                type="url"
                                                value={formData.url || ''}
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
                                                value={formData.amount || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel>Currency</FieldLabel>
                                            <Select
                                                name="currency"
                                                value={formData.currency}
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
                                                value={formData.billingCycle}
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
                                                value={formData.status}
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
                                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="notes">Notes</FieldLabel>
                                            <Textarea
                                                id="notes"
                                                name="notes"
                                                value={formData.notes || ''}
                                                onChange={handleChange}
                                                placeholder="Optional notes about this subscription…"
                                                rows={3}
                                            />
                                        </Field>
                                    </FieldGroup>
                                    <div className="flex gap-3">
                                        <Button type="submit" disabled={submitting} className="flex-1">
                                            {submitting ? 'Saving…' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push(`/dashboard/${id}`)}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        !error && <p className="text-muted-foreground">Subscription not found.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
