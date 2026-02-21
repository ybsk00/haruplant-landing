import { cookies } from 'next/headers';
import { convex } from './convex';
import { api } from '../convex/_generated/api';

const VISITOR_COOKIE_NAME = 'visitor_id';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Get or create visitor ID from cookies
 */
export async function getOrCreateVisitorId(): Promise<string> {
    const cookieStore = await cookies();
    const existingId = cookieStore.get(VISITOR_COOKIE_NAME)?.value;

    try {
        const visitorId = await convex.mutation(api.visitors.getOrCreate, { visitorId: existingId });
        return visitorId;
    } catch (error) {
        console.error('Failed to create visitor in Convex:', error);
        throw new Error('Failed to create visitor');
    }
}

/**
 * Set visitor cookie in response
 */
export function setVisitorCookie(visitorId: string) {
    return {
        name: VISITOR_COOKIE_NAME,
        value: visitorId,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    };
}

/**
 * Get visitor ID from cookies (without creating)
 */
export async function getVisitorId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(VISITOR_COOKIE_NAME)?.value || null;
}

/**
 * Check if visitor is registered (has lead data)
 */
export async function isVisitorRegistered(visitorId: string): Promise<boolean> {
    try {
        const lead = await convex.query(api.leads.getByVisitor, { visitorId });
        return !!lead;
    } catch (error) {
        return false;
    }
}

/**
 * Get lead data for visitor
 */
export async function getLeadByVisitorId(visitorId: string) {
    try {
        const lead = await convex.query(api.leads.getByVisitor, { visitorId });
        return lead;
    } catch (error) {
        return null;
    }
}
