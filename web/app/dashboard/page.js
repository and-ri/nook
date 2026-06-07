'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchApi } from "@/lib/api";
import { AlertCircle, Plus } from "lucide-react";

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', UAH: '₴' };
const BILLING_SUFFIX = { MONTHLY: '/mo', YEARLY: '/yr', WEEKLY: '/wk', DAILY: '/day' };
const STATUS_VARIANTS = { ACTIVE: 'default', TRIAL: 'secondary', PAUSED: 'outline', CANCELLED: 'destructive' };

function formatAmount(amount, currency, billingCycle) {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const suffix = BILLING_SUFFIX[billingCycle] || '';
    return `${symbol}${Number(amount).toFixed(2)}${suffix}`;
}

function statusLabel(status) {
    return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchApi('/subscriptions');
                setSubscriptions(response.subscriptions || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto py-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
                            {!loading && !error && (
                                <p className="text-sm text-muted-foreground">
                                    {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/new">
                                <Plus data-icon="inline-start" />
                                Add Subscription
                            </Link>
                        </Button>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertTitle>Failed to load subscriptions</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-5 w-2/3" />
                                        <Skeleton className="h-4 w-1/3" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-7 w-1/2" />
                                    </CardContent>
                                    <CardFooter>
                                        <Skeleton className="h-9 w-28" />
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                            <p className="text-lg font-medium">No subscriptions yet</p>
                            <p className="text-sm text-muted-foreground">Add your first subscription to get started.</p>
                            <Button asChild className="mt-2">
                                <Link href="/dashboard/new">
                                    <Plus data-icon="inline-start" />
                                    Add Subscription
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subscriptions.map((sub) => (
                                <Card key={sub.id}>
                                    <CardHeader>
                                        <CardTitle>{sub.name}</CardTitle>
                                        {sub.notes && (
                                            <CardDescription className="truncate">{sub.notes}</CardDescription>
                                        )}
                                        <CardAction>
                                            <Badge variant={STATUS_VARIANTS[sub.status] || 'outline'}>
                                                {statusLabel(sub.status)}
                                            </Badge>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">
                                            {formatAmount(sub.amount, sub.currency, sub.billingCycle)}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/${sub.id}`}>View details</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
