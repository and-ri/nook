'use client';

import { fetchApi } from "@/lib/api";
import { useState } from "react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please enter both email and password');
            return
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await fetchApi('/auth/login', {
                method: 'POST',
                body: { email, password },
            });
            
            document.cookie = `token=${response.token}; path=/;`;

            router.push('/dashboard');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 border rounded">
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>Login</FieldLegend>
                            <FieldDescription>Please enter your email and password to log in.</FieldDescription>
                            {error && (
                                <Alert>
                                    <AlertTitle>Login failed</AlertTitle>
                                    <AlertDescription>
                                    {error}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="input-email">Email</FieldLabel>
                                    <Input
                                        id="input-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="input-password">Password</FieldLabel>
                                    <Input
                                        id="input-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </FieldGroup>
                    <Button type="submit" disabled={loading} className="mt-4 w-full">
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Link href="/register" className="block text-center mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Don't have an account? Register
                    </Link>
                </form>
            </div>
        </div>
    );
}