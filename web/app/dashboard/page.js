'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubscriptions, getStats } from "@/lib/api";
import { SubscriptionIcon } from "@/components/ui/SubscriptionIcon";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { AlertCircle, ExternalLink, Plus, TrendingUp, Calendar, CreditCard } from "lucide-react";

function formatAmount(amount, currency, billingCycleSuffix) {
    return new Intl.NumberFormat('en', { style: 'currency', currency, minimumFractionDigits: 2 })
        .format(amount) + billingCycleSuffix;
}

// Small inline icon used inside Select dropdowns for payment methods
function PmIcon({ method }) {
    return (
        <span className="flex items-center gap-2">
            <SubscriptionIcon
                subscription={{ logoUrl: method.logoUrl, name: method.name }}
                size={16}
            />
            {method.name}
        </span>
    );
}

export default function DashboardPage() {
    const t      = useTranslations('Dashboard');
    const tStats = useTranslations('Stats');
    const tStatus = useTranslations('Status');
    const tCycle  = useTranslations('BillingCycle');

    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats]     = useState(null);

    // Filters
    const [filterCategory, setFilterCategory]           = useState('');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [subsRes, statsRes] = await Promise.all([getSubscriptions(), getStats()]);
                setSubscriptions(subsRes.subscriptions || []);
                setStats(statsRes);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Derive filter options from loaded data — no extra API calls needed
    const availableCategories = useMemo(() => {
        const map = {};
        subscriptions.forEach(s => s.categories?.forEach(c => { map[c.id] = c; }));
        return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
    }, [subscriptions]);

    const availablePaymentMethods = useMemo(() => {
        const map = {};
        subscriptions.forEach(s => {
            if (s.paymentMethod) map[s.paymentMethod.id] = s.paymentMethod;
        });
        return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
    }, [subscriptions]);

    // Client-side filtering
    const filtered = useMemo(() => subscriptions
        .filter(s => !filterCategory || s.categories?.some(c => c.id === filterCategory))
        .filter(s => !filterPaymentMethod || s.paymentMethodId === filterPaymentMethod),
        [subscriptions, filterCategory, filterPaymentMethod]
    );

    const hasActiveFilters = filterCategory || filterPaymentMethod;

    const statCards = stats ? [
        {
            icon: TrendingUp,
            label: tStats('monthlySpend'),
            value: new Intl.NumberFormat('en', {
                style: 'currency', currency: stats.currency, minimumFractionDigits: 2,
            }).format(stats.totalMonthlySpend),
        },
        { icon: CreditCard, label: tStats('activeSubscriptions'), value: stats.totalSubscriptions },
        { icon: Calendar,   label: tStats('upcomingRenewals'),    value: stats.upcomingRenewals?.length ?? 0 },
    ] : [];

    return (
        <div className="container mx-auto py-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
                    {!loading && !error && (
                        <p className="text-sm text-muted-foreground">
                            {t('subscriptionCount', { count: subscriptions.length })}
                        </p>
                    )}
                </div>
                <Button asChild>
                    <Link href="/dashboard/new">
                        <Plus data-icon="inline-start" />
                        {t('addSubscription')}
                    </Link>
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>{t('failedToLoad')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader><Skeleton className="h-4 w-2/3" /></CardHeader>
                                <CardContent><Skeleton className="h-7 w-1/2" /></CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="flex flex-col">
                                <CardHeader>
                                    <Skeleton className="h-5 w-2/3" />
                                    <Skeleton className="h-4 w-1/3" />
                                </CardHeader>
                                <CardContent className="flex-1"><Skeleton className="h-7 w-1/2" /></CardContent>
                                <CardFooter><Skeleton className="h-9 w-28" /></CardFooter>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    {/* Stats */}
                    {!error && stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {statCards.map(({ icon: Icon, label, value }) => (
                                <Card key={label}>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{value}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Filters */}
                    {subscriptions.length > 0 && (availableCategories.length > 0 || availablePaymentMethods.length > 0) && (
                        <div className="flex flex-wrap gap-2 items-center">
                            {availableCategories.length > 0 && (
                                <Select
                                    value={filterCategory || '__all__'}
                                    onValueChange={v => setFilterCategory(v === '__all__' ? '' : v)}
                                >
                                    <SelectTrigger className="h-8 text-sm w-[160px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="__all__">{t('allCategories')}</SelectItem>
                                            {availableCategories.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}

                            {availablePaymentMethods.length > 0 && (
                                <Select
                                    value={filterPaymentMethod || '__all__'}
                                    onValueChange={v => setFilterPaymentMethod(v === '__all__' ? '' : v)}
                                >
                                    <SelectTrigger className="h-8 text-sm w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="__all__">{t('allMethods')}</SelectItem>
                                            {availablePaymentMethods.map(pm => (
                                                <SelectItem key={pm.id} value={pm.id}>
                                                    <PmIcon method={pm} />
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => { setFilterCategory(''); setFilterPaymentMethod(''); }}
                                    className="h-8 text-muted-foreground"
                                >
                                    {t('clearFilters')}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Subscription grid */}
                    {subscriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                            <p className="text-lg font-medium">{t('noSubscriptions')}</p>
                            <p className="text-sm text-muted-foreground">{t('noSubscriptionsDesc')}</p>
                            <Button asChild className="mt-2">
                                <Link href="/dashboard/new">
                                    <Plus data-icon="inline-start" />
                                    {t('addSubscription')}
                                </Link>
                            </Button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
                            <p className="text-muted-foreground">{t('noResults')}</p>
                            <Button
                                variant="ghost" size="sm"
                                onClick={() => { setFilterCategory(''); setFilterPaymentMethod(''); }}
                            >
                                {t('clearFilters')}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((sub) => (
                                <Card key={sub.id} className="flex flex-col">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <SubscriptionIcon subscription={sub} size={22} />
                                            <span className="truncate">{sub.name}</span>
                                        </CardTitle>
                                        <CardAction>
                                            <div className="flex items-center gap-1">
                                                <StatusIcon status={sub.status} />
                                                <span className="text-xs text-muted-foreground">{tStatus(sub.status)}</span>
                                            </div>
                                        </CardAction>
                                    </CardHeader>

                                    <CardContent className="flex-1 flex flex-col gap-2 pt-0">
                                        {/* Amount */}
                                        <p className="text-2xl font-bold">
                                            {formatAmount(sub.amount, sub.currency, tCycle(`suffix.${sub.billingCycle}`))}
                                        </p>

                                        {/* Payment method */}
                                        {sub.paymentMethod && (
                                            <div className="flex items-center gap-1.5">
                                                <SubscriptionIcon
                                                    subscription={{ logoUrl: sub.paymentMethod.logoUrl, name: sub.paymentMethod.name }}
                                                    size={14}
                                                />
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {sub.paymentMethod.name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Categories */}
                                        {sub.categories?.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {sub.categories.map(c => (
                                                    <Badge key={c.id} variant="outline" className="text-xs px-1.5 py-0">
                                                        {c.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="gap-2 pt-3">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/${sub.id}`}>{t('viewDetails')}</Link>
                                        </Button>
                                        {sub.url && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a
                                                    href={sub.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={t('visitSite')}
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                                    {t('visitSite')}
                                                </a>
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
