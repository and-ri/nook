import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';


function FeatureCard({ title, description, icon }) {
    return (
        <div className="flex flex-col gap-3 p-6 rounded-xl border bg-card">
            <div className="text-2xl">{icon}</div>
            <h3 className="font-semibold text-base">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}

export default function HomePage() {
    const t = useTranslations('Landing');
    const tAuth = useTranslations('Auth');

    return (
        <div className="flex flex-col min-h-screen">
            {/* Nav */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto flex items-center justify-between h-14 px-4">
                    <span className="font-semibold tracking-tight">Subscree</span>
                    <nav className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {tAuth('login')}
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm px-4 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
                        >
                            {tAuth('register')}
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero */}
                <section className="container mx-auto px-4 pt-24 pb-20 text-center max-w-2xl">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
                        {t('heroHeadline')}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
                        {t('heroSubtitle')}
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Link
                            href="/register"
                            className="inline-flex h-11 items-center justify-center px-7 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            {t('ctaPrimary')}
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex h-11 items-center justify-center px-7 rounded-full border text-sm font-medium hover:bg-muted transition-colors"
                        >
                            {t('ctaSecondary')}
                        </Link>
                    </div>
                </section>

                <Separator />

                {/* Features */}
                <section className="container mx-auto px-4 py-16 max-w-5xl">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard
                            icon="📋"
                            title={t('feature1Title')}
                            description={t('feature1Desc')}
                        />
                        <FeatureCard
                            icon="📊"
                            title={t('feature2Title')}
                            description={t('feature2Desc')}
                        />
                        <FeatureCard
                            icon="🔔"
                            title={t('feature3Title')}
                            description={t('feature3Desc')}
                        />
                        <FeatureCard
                            icon="👥"
                            title={t('feature4Title')}
                            description={t('feature4Desc')}
                        />
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t">
                <div className="container mx-auto flex items-center justify-between h-14 px-4">
                    <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Subscree</p>
                    <Link
                        href="https://github.com/and-ri/subscree"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        GitHub
                    </Link>
                </div>
            </footer>
        </div>
    );
}
