import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Lock, AlertCircle, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Credenciais administrativas requeridas.');
      setIsLoading(false);
      return;
    }

    try {
      // Security Note: We use the standard client-side auth method.
      // 'auth.admin' methods are for server-side only and should not be used in the frontend.
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role,status')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError || !profile) {
          throw profileError || new Error('Perfil administrativo não encontrado.');
        }

        if (profile.role !== 'admin' || profile.status !== 'active') {
          await supabase.auth.signOut();
          setError("Acesso restrito a administradores.");
          return;
        }

        onLogin();
      }
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      // Map common Supabase errors to user-friendly messages
      if (err.message.includes("Invalid login credentials")) {
        setError("E-mail ou senha incorretos.");
      } else {
        setError(err.message || "Falha na autenticação.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 sm:p-6 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[380px]"
      >
        <button
          onClick={onBack}
          className="mb-6 text-slate-500 hover:text-slate-800 flex items-center text-[15px] font-medium transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft size={18} className="mr-1" strokeWidth={2.5} />
          Voltar
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-[22px] bg-slate-800 shadow-lg shadow-slate-900/20">
            <ShieldAlert size={28} className="text-red-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h2>
          <p className="text-slate-500 mt-2 text-[15px] leading-relaxed">Acesso restrito a administradores.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="bg-red-50/80 backdrop-blur-md text-red-700 px-4 py-3 rounded-2xl flex items-center text-[13px] font-semibold shadow-sm border border-red-200"
              >
                <AlertCircle size={16} className="mr-2 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {/* Admin Input Style - Darker/Red Focus */}
            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ID Administrativo (Email)"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-[17px] text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" size={20} strokeWidth={2} />
              </div>

              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Chave de Acesso"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-[17px] text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" size={20} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-700 text-white font-semibold text-[17px] rounded-full shadow-lg shadow-slate-900/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Autenticando...
                </>
              ) : (
                "Acessar Painel"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
