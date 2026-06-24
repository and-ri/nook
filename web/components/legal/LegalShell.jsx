import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

// Chrome labels for legal pages, kept here so both Privacy and Terms share them.
const UI = {
    en: { back: 'Back to home', updated: 'Last updated', privacy: 'Privacy Policy', terms: 'Terms of Use', home: 'Home' },
    uk: { back: 'На головну', updated: 'Останнє оновлення', privacy: 'Політика конфіденційності', terms: 'Правила використання', home: 'Головна' },
};

// Renders a legal document from structured content so Privacy and Terms stay
// consistent. `sections` is an array of { heading, body?: string[], items?: string[] }.
export function LegalShell({ locale = 'en', title, updatedISO, intro, sections }) {
    const ui = UI[locale] ?? UI.en;
    const updated = new Date(updatedISO).toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-US', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="h-6 w-6" />
                        <span className="font-semibold tracking-tight">Subscree</span>
                    </Link>
                    <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {ui.back}
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                <article className="container mx-auto max-w-2xl px-4 py-12">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{ui.updated}: {updated}</p>
                    {intro && <p className="mt-6 leading-relaxed text-muted-foreground">{intro}</p>}

                    <div className="mt-8 flex flex-col gap-8">
                        {sections.map((s, i) => (
                            <section key={i}>
                                <h2 className="text-lg font-semibold">{i + 1}. {s.heading}</h2>
                                {s.body?.map((p, j) => (
                                    <p key={j} className="mt-3 text-sm leading-relaxed text-muted-foreground">{p}</p>
                                ))}
                                {s.items && (
                                    <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                                        {s.items.map((it, j) => <li key={j}>{it}</li>)}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </div>
                </article>
            </main>

            <footer className="border-t">
                <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
                    <span>© {new Date().getFullYear()} Subscree</span>
                    <nav className="flex items-center gap-4">
                        <Link href="/" className="transition-colors hover:text-foreground">{ui.home}</Link>
                        <Link href="/privacy" className="transition-colors hover:text-foreground">{ui.privacy}</Link>
                        <Link href="/terms" className="transition-colors hover:text-foreground">{ui.terms}</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
