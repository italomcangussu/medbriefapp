import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DO SUPABASE
// ------------------------------------------------------------------

// Tenta obter de variáveis de ambiente (Vite standard) ou usa fallback.
// Utilizamos 'import.meta.env && ...' para evitar erros de runtime caso o objeto env não esteja definido.
const SUPABASE_URL = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 'https://nifoyacnfmapqdnimlda.supabase.co';
const SUPABASE_ANON_KEY = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || '';

// Verifica se as chaves são placeholders ou vazias
if (!SUPABASE_URL || SUPABASE_URL.includes('SUA_SUPABASE_URL')) {
  console.warn('⚠️ Supabase credentials not set properly. Check your environment variables.');
}

// Inicializa o cliente
// A persistência de sessão (localStorage) é tratada automaticamente pelo supabase-js
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * NOTA DE SEGURANÇA:
 * É seguro expor a URL e a ANON KEY no frontend (navegador/app mobile),
 * DESDE QUE você tenha configurado "Row Level Security" (RLS) no seu banco de dados.
 * 
 * NUNCA coloque a "service_role" key aqui.
 */