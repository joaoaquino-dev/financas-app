import { createClient } from '@supabase/supabase-js';

// Chave pública do cliente. O acesso aos dados é protegido por login e RLS.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://liajnsmwmnodczdwtnhk.supabase.co',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ahoUDQWVYoqPepwrsOQhKQ_0rS48xTj',
  { auth: { storageKey: 'financas-auth', detectSessionInUrl: true } },
);
