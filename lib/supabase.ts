import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Visitor {
    id: string;
    created_at: string;
    expires_at: string;
}

export interface Lead {
    id: string;
    visitor_id: string;
    name: string;
    phone: string;
    privacy_agreed: boolean;
    privacy_version: string;
    created_at: string;
    expires_at: string;
}

export interface Booking {
    id: string;
    visitor_id: string;
    service: string;
    status: string;
    created_at: string;
    expires_at: string;
}
