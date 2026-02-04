import { cookies } from 'next/headers';
import { supabase } from './supabase';

const VISITOR_COOKIE_NAME = 'visitor_id';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Get or create visitor ID from cookies
 */
export async function getOrCreateVisitorId(): Promise<string> {
    const cookieStore = await cookies();
    const existingId = cookieStore.get(VISITOR_COOKIE_NAME)?.value;

    if (existingId) {
        // Verify visitor still exists in DB
        const { data } = await supabase
            .from('visitors')
            .select('id')
            .eq('id', existingId)
            .single();

        if (data) {
            return existingId;
        }
    }

    // Create new visitor
    const { data: newVisitor, error } = await supabase
        .from('visitors')
        .insert({})
        .select('id')
        .single();

    if (error || !newVisitor) {
        throw new Error('Failed to create visitor');
    }

    return newVisitor.id;
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
    const { data } = await supabase
        .from('leads')
        .select('id')
        .eq('visitor_id', visitorId)
        .single();

    return !!data;
}

/**
 * Get lead data for visitor
 */
export async function getLeadByVisitorId(visitorId: string) {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('visitor_id', visitorId)
        .single();

    if (error) return null;
    return data;
}
