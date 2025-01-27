import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vgildzekbdyqhalvkeln.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnaWxkemVrYmR5cWhhbHZrZWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzcxNTY5NiwiZXhwIjoyMDUzMjkxNjk2fQ.08ZuaDtD5h58yUsyRottYRfjyFn5TGg9C6LycD1t_l4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
