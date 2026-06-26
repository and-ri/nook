import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import {
    LayoutList, PieChart, BellRing, Users, Coins, ShieldCheck,
    ArrowRight, Check, Image as ImageIcon, Plus, Wallet,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { LandingLangSwitcher } from '@/components/LandingLangSwitcher';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://subscree.app';

// Localized, page-specific SEO metadata (merges over the defaults in layout.js).
export async function generateMetadata() {
    const t = await getTranslations('Landing');
    return {
        title: { absolute: t('seoTitle') },
        description: t('seoDescription'),
        openGraph: {
            title: t('seoTitle'),
            description: t('seoDescription'),
            images: [{ url: '/og.png', width: 1200, height: 630, alt: t('ogImageAlt') }],
        },
        twitter: { title: t('seoTitle'), description: t('seoDescription') },
    };
}

/* =========================================================================
   SCREENSHOT PLACEHOLDERS
   Each <BrowserShot> / <PhoneShot> below is a gray placeholder. To ship real
   imagery, replace the placeholder element with a Next.js <Image> (or <img>)
   of the captured screen. The `caption`/`hint` props describe exactly what to
   capture and at what size. Suggested location: web/public/screenshots/.
   ========================================================================= */

// A browser-window framed shot for desktop/web screenshots (16:10).
// Pass `src` (+ `alt`) to show a real screenshot; without it, a gray placeholder
// with capture instructions is shown.
function BrowserShot({ caption, hint, src, alt, className = '' }) {
    return (
        <div className={`overflow-hidden rounded-xl border bg-card shadow-sm ${className}`}>
            <div className="flex items-center gap-1.5 h-9 px-4 border-b bg-muted/40">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
                <div className="ml-3 h-4 w-48 max-w-[40%] rounded bg-muted-foreground/10" />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden bg-[repeating-linear-gradient(45deg,var(--muted)_0,var(--muted)_12px,transparent_12px,transparent_24px)]">
                {src ? (
                    <Image loading="eager" src={src} alt={alt || caption} fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                        <ImageIcon className="h-9 w-9 text-muted-foreground/40" aria-hidden />
                        <p className="text-sm font-medium text-muted-foreground">{caption}</p>
                        <p className="text-xs text-muted-foreground/70 max-w-sm">{hint}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// A phone-shaped shot for mobile screenshots (~9:19). Pass `src` (+ `alt`) for a
// real screenshot; without it, a gray placeholder is shown.
function PhoneShot({ caption, hint, src, alt }) {
    return (
        <div className="mx-auto w-[220px] rounded-[2.2rem] border-4 border-foreground/80 bg-card p-2 shadow-xl">
            <div className="relative aspect-[9/19] overflow-hidden rounded-[1.6rem] bg-[repeating-linear-gradient(45deg,var(--muted)_0,var(--muted)_12px,transparent_12px,transparent_24px)]">
                {src ? (
                    <Image loading="eager" src={src} alt={alt || caption} fill sizes="220px" className="object-cover" />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-5 text-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" aria-hidden />
                        <p className="text-xs font-medium text-muted-foreground">{caption}</p>
                        <p className="text-[11px] text-muted-foreground/70">{hint}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Inactive store badges (links intentionally omitted until the apps ship).
function AppleIcon(props) {
    return (
        <svg viewBox="0 0 384 512" className="h-6 w-6" fill="currentColor" aria-hidden {...props}>
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
    );
}
function GooglePlayIcon(props) {
    return (
        <svg viewBox="0 0 512 512" className="h-6 w-6" fill="currentColor" aria-hidden {...props}>
            <path d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm278.3 234.3L104.6 13l280.8 162.2-60.1 59.1zm0 43.4L385.4 337 104.6 499l220.7-221.3zm87.9-52.1-58.9-34.1-65.7 65.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-61.8z" />
        </svg>
    );
}

function StoreBadge({ icon, line1, line2, soon }) {
    return (
        <div
            role="button"
            aria-disabled="true"
            title={soon}
            className="relative inline-flex h-[52px] items-center gap-3 rounded-xl bg-foreground px-4 text-background opacity-70 cursor-not-allowed select-none"
        >
            {icon}
            <span className="flex flex-col text-left leading-tight">
                <span className="text-[10px] uppercase tracking-wide opacity-80">{line1}</span>
                <span className="text-base font-semibold -mt-0.5">{line2}</span>
            </span>
            <span className="absolute -top-2 -right-2 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground">
                {soon}
            </span>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-6 transition-colors hover:bg-accent/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                <Icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
    );
}

function ShowcaseRow({ title, description, shot, reversed }) {
    return (
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className={reversed ? 'lg:order-2' : ''}>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <div className={reversed ? 'lg:order-1' : ''}>{shot}</div>
        </div>
    );
}

export default function HomePage() {
    const t = useTranslations('Landing');
    const tAuth = useTranslations('Auth');

    const features = [
        { icon: LayoutList,  title: t('feature1Title'), description: t('feature1Desc') },
        { icon: PieChart,    title: t('feature2Title'), description: t('feature2Desc') },
        { icon: BellRing,    title: t('feature3Title'), description: t('feature3Desc') },
        { icon: Users,       title: t('feature4Title'), description: t('feature4Desc') },
        { icon: Coins,       title: t('feature5Title'), description: t('feature5Desc') },
        { icon: ShieldCheck, title: t('feature6Title'), description: t('feature6Desc') },
    ];

    const steps = [
        { icon: Plus,     title: t('step1Title'), description: t('step1Desc') },
        { icon: Wallet,   title: t('step2Title'), description: t('step2Desc') },
        { icon: BellRing, title: t('step3Title'), description: t('step3Desc') },
    ];

    // Structured data for rich results (SoftwareApplication).
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Subscree',
        url: siteUrl,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web, iOS, Android',
        description: t('seoDescription'),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };

    return (
        <div className="flex min-h-screen flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Header */}
            <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="h-6 w-6" />
                        <span className="font-semibold tracking-tight">Subscree</span>
                    </Link>
                    <nav className="flex items-center gap-1 sm:gap-3">
                        <a href="#features" className="hidden px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline">
                            {t('navFeatures')}
                        </a>
                        <a href="#how" className="hidden px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline">
                            {t('navHowItWorks')}
                        </a>
                        <LandingLangSwitcher />
                        <Link href="/login" className="hidden px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline">
                            {tAuth('login')}
                        </Link>
                        <Link href="/register" className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
                            {tAuth('register')}
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 to-background" />
                    <div className="container mx-auto px-4 pt-20 pb-12 text-center sm:pt-28">
                        <span className="inline-flex items-center rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                            {t('heroEyebrow')}
                        </span>
                        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                            {t('heroHeadline')}
                        </h1>
                        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                            {t('heroSubtitle')}
                        </p>
                        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                            <Link href="/register" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-opacity hover:opacity-90">
                                {t('ctaPrimary')}
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-full border px-7 text-sm font-medium transition-colors hover:bg-muted">
                                {t('ctaSecondary')}
                            </Link>
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">{t('heroNote')}</p>

                        {/* Hero screenshot.
                            Replace with: the Dashboard at /dashboard — the monthly-total
                            stats cards on top and the full subscription list below.
                            Capture in light theme, ~2560×1600 (16:10), browser at ~1280px wide. */}
                        <div className="mx-auto mt-14 max-w-5xl">
                            <BrowserShot
                                src="/screenshots/subscree.app_dashboard.png"
                                alt="Dashboard screenshot"
                            />
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="container mx-auto px-4 py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('featuresTitle')}</h2>
                        <p className="mt-3 text-muted-foreground">{t('featuresSubtitle')}</p>
                    </div>
                    <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map(f => (
                            <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
                        ))}
                    </div>
                </section>

                {/* Showcase */}
                <section className="border-t bg-muted/20">
                    <div className="container mx-auto flex max-w-5xl flex-col gap-20 px-4 py-20">
                        <ShowcaseRow
                            title={t('showcase1Title')}
                            description={t('showcase1Desc')}
                            shot={
                                /* Replace with: the subscription list / a subscription's
                                   detail view showing logo, amount, cycle, next charge.
                                   ~2200×1375 (16:10), light theme. */
                                <BrowserShot
                                    src="/screenshots/subscree.app_dashboard_reports.png"
                                    alt="Subscriptions screenshot"
                                />
                            }
                        />
                        <ShowcaseRow
                            reversed
                            title={t('showcase2Title')}
                            description={t('showcase2Desc')}
                            shot={
                                /* Replace with: the Reports page at /dashboard/reports —
                                   spending-by-category chart + totals. ~2200×1375, light theme. */
                                <BrowserShot
                                    src="/screenshots/subscree.app_reports_detailed.png"
                                    alt="Reports screenshot"
                                />
                            }
                        />
                        <ShowcaseRow
                            title={t('showcase3Title')}
                            description={t('showcase3Desc')}
                            shot={
                                /* Replace with: the Team page at /dashboard/team — members
                                   list + pending invitations. ~2200×1375, light theme. */
                                <BrowserShot
                                    src="/screenshots/subscree.app_team.png"
                                    alt="Team screenshot"
                                />
                            }
                        />
                    </div>
                </section>

                {/* How it works */}
                <section id="how" className="container mx-auto px-4 py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('howTitle')}</h2>
                        <p className="mt-3 text-muted-foreground">{t('howSubtitle')}</p>
                    </div>
                    <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
                        {steps.map((s, i) => (
                            <div key={s.title} className="flex flex-col items-center text-center">
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border bg-card">
                                    <s.icon className="h-5 w-5" aria-hidden />
                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                                        {i + 1}
                                    </span>
                                </div>
                                <h3 className="mt-4 font-semibold">{s.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Mobile / app stores */}
                <section className="border-t bg-muted/20">
                    <div className="container mx-auto grid max-w-5xl items-center gap-10 px-4 py-20 lg:grid-cols-2">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('mobileTitle')}</h2>
                            <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">{t('mobileDesc')}</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <StoreBadge
                                    icon={<AppleIcon />}
                                    line1={t('storeAppStoreLine1')}
                                    line2={t('storeAppStoreLine2')}
                                    soon={t('comingSoon')}
                                />
                                <StoreBadge
                                    icon={<GooglePlayIcon />}
                                    line1={t('storeGooglePlayLine1')}
                                    line2={t('storeGooglePlayLine2')}
                                    soon={t('comingSoon')}
                                />
                            </div>
                        </div>
                        {/* Replace with: a mobile screenshot (e.g. the dashboard or a
                            subscription detail) from the Expo app. ~1170×2532 (9:19.5). */}
                        <PhoneShot
                            src="/screenshots/subscree.app_dashboard_mobile.png"
                            alt="Mobile dashboard screenshot"
                        />
                    </div>
                </section>

                {/* Final CTA */}
                <section className="container mx-auto px-4 py-24">
                    <div className="mx-auto max-w-3xl rounded-2xl border bg-card px-6 py-14 text-center shadow-sm">
                        <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">{t('finalTitle')}</h2>
                        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t('finalSubtitle')}</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Link href="/register" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-opacity hover:opacity-90">
                                {t('ctaPrimary')}
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                        </div>
                        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Check className="h-3.5 w-3.5" aria-hidden />
                            {t('heroNote')}
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t">
                <div className="container mx-auto flex flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-2">
                            <Logo className="h-5 w-5" />
                            <span className="font-semibold tracking-tight">Subscree</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{t('footerTagline')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <a href="#features" className="transition-colors hover:text-foreground">{t('navFeatures')}</a>
                        <Link href="/privacy" className="transition-colors hover:text-foreground">{t('privacy')}</Link>
                        <Link href="/terms" className="transition-colors hover:text-foreground">{t('terms')}</Link>
                        <Link href="/login" className="transition-colors hover:text-foreground">{tAuth('login')}</Link>
                        <Link
                            href="https://github.com/subscree/subscree"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-foreground"
                        >
                            GitHub
                        </Link>
                    </div>
                </div>
                <div className="border-t">
                    <div className="container mx-auto px-4 py-4">
                        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Subscree</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
