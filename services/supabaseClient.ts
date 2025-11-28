
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cnhjqfpvpyahemphwkvd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaGpxZnB2cHlhaGVtcGh3a3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTY0NTcsImV4cCI6MjA3OTczMjQ1N30.9HcOP85k_6pSdv9IZISBWCsTwqPWhPIEdvQlCS8NjEg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
