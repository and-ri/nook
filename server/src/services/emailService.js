import nodemailer from 'nodemailer';

// Email delivery with two interchangeable providers, selected by env:
//   - Resend:  set RESEND_API_KEY (takes priority)
//   - SMTP:    set SMTP_HOST (+ SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE)
// If neither is configured, emails are logged to the console (dev fallback).

const FROM = process.env.EMAIL_FROM || 'Subscree <no-reply@subscree.app>';

let smtpTransport = null;
function getSmtpTransport() {
    if (smtpTransport) return smtpTransport;
    smtpTransport = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth:   process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
    });
    return smtpTransport;
}

async function sendViaResend({ to, subject, html, text }) {
    const res = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type':  'application/json',
        },
        body: JSON.stringify({ from: FROM, to, subject, html, text }),
    });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Resend failed: ${res.status} ${body}`);
    }
}

async function sendViaSmtp({ to, subject, html, text }) {
    await getSmtpTransport().sendMail({ from: FROM, to, subject, html, text });
}

// Whether any provider is configured. Used to skip notification work entirely.
export function isEmailConfigured() {
    return Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
}

export async function sendEmail({ to, subject, html, text }) {
    if (process.env.RESEND_API_KEY) {
        return sendViaResend({ to, subject, html, text });
    }
    if (process.env.SMTP_HOST) {
        return sendViaSmtp({ to, subject, html, text });
    }
    console.log(`[email] (no provider configured) would send to ${to}: ${subject}`);
}
