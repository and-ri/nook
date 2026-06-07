'use client';

import Link from "next/link";
import { Button } from "../ui/button";

export const Header = () => {
    const handleLogout = () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
    };

    return (
        <header className="bg-background border-b sticky top-0 z-10">
            <div className="container mx-auto flex items-center justify-between h-16">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight">
                    Subscription Manager
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </header>
    );
};
