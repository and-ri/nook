'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubscriptionIcon } from '@/components/ui/SubscriptionIcon';
import { StatusIcon } from '@/components/ui/StatusIcon';
import { getSubscriptions, getStats } from '@/lib/api';
import { toMonthly } from '@/lib/billing';

const STATUS_COLORS = {
    ACTIVE: '#22c55e', TRIAL: '#3b82f6', PAUSED: '#f59e0b', CANCELLED: '#ef4444',
};
const CHART_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#14b8a6'];

function fmt(amount, currency) {
    return new Intl.NumberFormat('en', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReportsPage() {
    const t  = useTranslations('Reports');
    const ts = useTranslations('Status');
    const tc = useTranslations('BillingCycle');

    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [subs,    setSubs]    = useState([]);
    const [stats,   setStats]   = useState(null);

    useEffect(() => {
        Promise.all([getSubscriptions(), getStats()])
            .then(([s, st]) => { setSubs(s.subscriptions || []); setStats(st); })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="container mx-auto py-8 flex flex-col gap-6">
            <Skeleton className="h-8 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-56" />)}
            </div>
        </div>
    );

    if (error) return (
        <div className="container mx-auto py-8">
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
        </div>
    );

    // Status breakdown
    const statusData = Object.entries(stats?.subscriptionsByStatus ?? {}).map(([name, value]) => ({
        name: ts(name), value, color: STATUS_COLORS[name],
    }));

    // Billing cycle breakdown (monthly equivalents, in preferredCurrency)
    const cycleMap = {};
    subs.filter(s => s.status === 'ACTIVE').forEach(s => {
        const monthly = toMonthly(s.amount, s.billingCycle);
        cycleMap[s.billingCycle] = (cycleMap[s.billingCycle] ?? 0) + monthly;
    });
    const cycleData = Object.entries(cycleMap).map(([cycle, value]) => ({
        name: tc(cycle), value: Math.round(value * 100) / 100,
    }));

    // Category breakdown
    const catMap = {};
    subs.forEach(s => {
        if (!s.categories?.length) {
            catMap['Uncategorized'] = (catMap['Uncategorized'] ?? 0) + toMonthly(s.amount, s.billingCycle);
        } else {
            s.categories.forEach(c => {
                catMap[c.name] = (catMap[c.name] ?? 0) + toMonthly(s.amount, s.billingCycle);
            });
        }
    });
    const catData = Object.entries(catMap)
        .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
        .sort((a, b) => b.value - a.value);

    const currency = stats?.currency ?? 'USD';

    // Sorted subscriptions table
    const sorted = [...subs].sort((a, b) => toMonthly(b.amount, b.billingCycle) - toMonthly(a.amount, a.billingCycle));

    return (
        <div className="container mx-auto py-8 flex flex-col gap-6">
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: t('totalMonthly'), value: fmt(stats?.totalMonthlySpend ?? 0, currency) },
                    { label: t('totalActive'),  value: stats?.totalSubscriptions ?? 0 },
                    { label: t('upcoming'),     value: stats?.upcomingRenewals?.length ?? 0 },
                    { label: t('total'),        value: subs.length },
                ].map(({ label, value }) => (
                    <Card key={label}>
                        <CardHeader className="pb-1">
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-bold">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status pie */}
                <Card>
                    <CardHeader><CardTitle className="text-base">{t('byStatus')}</CardTitle></CardHeader>
                    <CardContent>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                         dataKey="value" nameKey="name" paddingAngle={3}>
                                        {statusData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [v, n]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-muted-foreground text-sm py-10 text-center">{t('noData')}</p>}
                    </CardContent>
                </Card>

                {/* Category bar */}
                <Card>
                    <CardHeader><CardTitle className="text-base">{t('byCategory')}</CardTitle></CardHeader>
                    <CardContent>
                        {catData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={catData} layout="vertical" margin={{ left: 8, right: 24 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={v => fmt(v, currency)} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-muted-foreground text-sm py-10 text-center">{t('noData')}</p>}
                    </CardContent>
                </Card>

                {/* Billing cycle bar */}
                <Card>
                    <CardHeader><CardTitle className="text-base">{t('byCycle')}</CardTitle></CardHeader>
                    <CardContent>
                        {cycleData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={cycleData}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis hide />
                                    <Tooltip formatter={v => fmt(v, currency)} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {cycleData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-muted-foreground text-sm py-10 text-center">{t('noData')}</p>}
                    </CardContent>
                </Card>

                {/* Upcoming renewals */}
                <Card>
                    <CardHeader><CardTitle className="text-base">{t('upcoming')}</CardTitle></CardHeader>
                    <CardContent>
                        {stats?.upcomingRenewals?.length > 0 ? (
                            <ul className="flex flex-col gap-2">
                                {stats.upcomingRenewals.map(s => (
                                    <li key={s.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <SubscriptionIcon subscription={s} size={20} />
                                            <span className="font-medium">{s.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <span>{formatDate(s.nextBillingDate)}</span>
                                            <span className="font-medium text-foreground">
                                                {fmt(s.amount, s.currency)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-muted-foreground text-sm py-6 text-center">{t('noUpcoming')}</p>}
                    </CardContent>
                </Card>
            </div>

            {/* All subscriptions table */}
            <Card>
                <CardHeader><CardTitle className="text-base">{t('allSubscriptions')}</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/40">
                                <tr>
                                    {[t('colName'), t('colAmount'), t('colCycle'), t('colStatus'), t('colNextDate'), t('colCategory')].map(h => (
                                        <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map(s => (
                                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2 font-medium">
                                                <SubscriptionIcon subscription={s} size={20} />
                                                {s.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 font-mono">{fmt(s.amount, s.currency)}</td>
                                        <td className="px-4 py-2.5 text-muted-foreground">{tc(s.billingCycle)}</td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <StatusIcon status={s.status} />
                                                <span>{ts(s.status)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-muted-foreground">{formatDate(s.nextBillingDate)}</td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-wrap gap-1">
                                                {s.categories?.map(c => <Badge key={c.id} variant="outline" className="text-xs">{c.name}</Badge>)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
