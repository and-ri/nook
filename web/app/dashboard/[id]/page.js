'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchApi } from "@/lib/api";
import { AlertCircle, ArrowLeft } from "lucide-react";

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', UAH: '₴' };
const BILLING_LABELS = { MONTHLY: 'Monthly', YEARLY: 'Yearly', WEEKLY: 'Weekly', DAILY: 'Daily' };
const STATUS_VARIANTS = { ACTIVE: 'default', TRIAL: 'secondary', PAUSED: 'outline', CANCELLED: 'destructive' };

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(amount, currency) {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${Number(amount).toFixed(2)} ${currency}`;
}

function statusLabel(status) {
    return status.charAt(0) + status.slice(1).toLowerCase();
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}

export default function SubscriptionDetailsPage({ params }) {
    const { id } = use(params);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchSubscription = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchApi(`/subscriptions/${id}`);
                setSubscription(response.subscription);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [id]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetchApi(`/subscriptions/${id}`, { method: 'DELETE' });
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
            setDeleting(false);
        }
    };

    const sub = subscription;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto py-8 max-w-2xl flex flex-col gap-6">
                    <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
                        <Link href="/dashboard">
                            <ArrowLeft data-icon="inline-start" />
                            Back to subscriptions
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
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-5 w-full" />
                                ))}
                            </CardContent>
                        </Card>
                    ) : sub ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">{sub.name}</CardTitle>
                                {sub.notes && <CardDescription>{sub.notes}</CardDescription>}
                                <CardAction>
                                    <Badge variant={STATUS_VARIANTS[sub.status] || 'outline'}>
                                        {statusLabel(sub.status)}
                                    </Badge>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col">
                                    <DetailRow label="Amount" value={formatAmount(sub.amount, sub.currency)} />
                                    <Separator />
                                    <DetailRow label="Billing cycle" value={BILLING_LABELS[sub.billingCycle] || sub.billingCycle} />
                                    <Separator />
                                    <DetailRow label="Next billing date" value={formatDate(sub.nextBillingDate)} />
                                    <Separator />
                                    <DetailRow label="Start date" value={formatDate(sub.startDate)} />
                                    {sub.cancelledAt && (
                                        <>
                                            <Separator />
                                            <DetailRow label="Cancelled at" value={formatDate(sub.cancelledAt)} />
                                        </>
                                    )}
                                    {sub.url && (
                                        <>
                                            <Separator />
                                            <div className="flex items-center justify-between py-3">
                                                <span className="text-sm text-muted-foreground">Website</span>
                                                <a
                                                    href={sub.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary underline-offset-4 hover:underline truncate max-w-xs"
                                                >
                                                    {sub.url}
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="flex gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href={`/dashboard/${id}/edit`}>Edit</Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" disabled={deleting}>
                                                {deleting ? 'Deleting…' : 'Delete'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete subscription?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete <strong>{sub.name}</strong>. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardFooter>
                        </Card>
                    ) : (
                        !error && <p className="text-muted-foreground">Subscription not found.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
