'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Separator } from "@/components/ui/separator";

export function Footer() {
    const t = useTranslations('Footer');
    const year = new Date().getFullYear();

    return (
        <footer className="mt-auto">
            <Separator />
            <div className="container mx-auto flex items-center justify-between h-14 px-4">
                <p className="text-sm text-muted-foreground">
                    © {year} Nook
                </p>
                <Link
                    href="https://github.com/and-ri/nook"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    {t('github')}
                </Link>
            </div>
        </footer>
    );
}
