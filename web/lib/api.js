'use client';

export async function fetchApi(path, options = {}) {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;

    const token = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;

    try {
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }

        if (response.status === 204) {
            return null; // No content
        }

        return response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}