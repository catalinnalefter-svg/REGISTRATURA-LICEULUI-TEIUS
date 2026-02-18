import { createClient } from '@supabase/supabase-js';

// Folosim valorile din Vercel, sau un text gol daca nu sunt gata inca
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hgyfidquwuzcadrwghaj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
