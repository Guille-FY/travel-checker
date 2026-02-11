import { createClient } from '@supabase/supabase-js';

// These should be environment variables.
// For now, I'll use placeholders. The user will need to supply these.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
