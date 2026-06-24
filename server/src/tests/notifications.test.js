import { describe, it, expect } from 'vitest';
import {
    zonedToday, inSendWindow, isMonday, dateKey, addDays,
} from '../services/notificationService.js';

// 2026-06-22 is a Monday.
const monday0730Z = new Date('2026-06-22T07:30:00Z');
const monday1000Z = new Date('2026-06-22T10:00:00Z');
const monday0100Z = new Date('2026-06-22T01:00:00Z');

describe('notification timezone helpers', () => {
    it('inSendWindow respects the user timezone (09:00–12:00 local)', () => {
        // 07:30Z is 10:30 in Kyiv (UTC+3) → in window; 07:30 in UTC → not yet.
        expect(inSendWindow(monday0730Z, 'Europe/Kyiv')).toBe(true);
        expect(inSendWindow(monday0730Z, 'UTC')).toBe(false);
        // 10:00Z is in window for UTC but 13:00 in Kyiv → past the window.
        expect(inSendWindow(monday1000Z, 'UTC')).toBe(true);
        expect(inSendWindow(monday1000Z, 'Europe/Kyiv')).toBe(false);
    });

    it('zonedToday / isMonday cross the date boundary by timezone', () => {
        // 01:00Z Monday is still Sunday in New York (UTC-4).
        expect(zonedToday(monday0100Z, 'Europe/Kyiv')).toBe('2026-06-22');
        expect(isMonday(monday0100Z, 'Europe/Kyiv')).toBe(true);
        expect(zonedToday(monday0100Z, 'America/New_York')).toBe('2026-06-21');
        expect(isMonday(monday0100Z, 'America/New_York')).toBe(false);
    });

    it('dateKey returns the UTC calendar date regardless of time', () => {
        expect(dateKey(new Date('2026-06-25T00:00:00Z'))).toBe('2026-06-25');
        expect(dateKey(new Date('2026-06-25T23:59:00Z'))).toBe('2026-06-25');
    });

    it('addDays shifts a YYYY-MM-DD key, crossing month boundaries', () => {
        expect(addDays('2026-06-22', 3)).toBe('2026-06-25');
        expect(addDays('2026-06-30', 1)).toBe('2026-07-01');
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    });
});
