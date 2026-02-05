import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
  onAdminMode: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister, onAdminMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Secret Admin Trigger State
  const [, setSecretClicks] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // iOS Spring Animation Configuration
  const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 };

  const handleGoogleLogin = async () => {
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (authError) throw authError;
      // The redirect happens automatically
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(err.message || "Falha ao iniciar login com Google.");
    }
  };

  const handleSecretClick = () => {
    setSecretClicks(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        onAdminMode();
        return 0;
      }
      return newCount;
    });

    // Reset clicks if user stops clicking for 1 second
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setSecretClicks(0);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (!email.includes('@')) {
      setError('E-mail inválido.');
      return;
    }
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      onLogin();
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.message.includes("Invalid login credentials")) {
        setError("E-mail ou senha incorretos.");
      } else {
        setError(err.message || "Falha na autenticação.");
      }
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={springTransition}
        className="w-full max-w-[380px]"
      >
        {/* iOS Large Title Style */}
        <div className="text-center mb-8">
          <div
            onClick={handleSecretClick}
            className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-[22px] bg-white shadow-lg shadow-slate-200/50 cursor-pointer active:scale-95 transition-transform select-none"
          >
            <LogIn size={28} className="text-[#007AFF]" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bem-vindo</h2>
          <p className="text-slate-500 mt-2 text-[15px] leading-relaxed">Faça login para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="bg-red-50/80 backdrop-blur-md text-red-600 px-4 py-3 rounded-2xl flex items-center text-[13px] font-semibold shadow-sm border border-red-100/50"
              >
                <AlertCircle size={16} className="mr-2 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {/* iOS Style Input Group */}
            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange(setEmail, e.target.value)}
                  placeholder="E-mail"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-[17px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all duration-300 outline-none border border-transparent focus:border-[#007AFF]/30"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#007AFF]" size={20} strokeWidth={2} />
              </div>

              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleInputChange(setPassword, e.target.value)}
                  placeholder="Senha"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-[17px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all duration-300 outline-none border border-transparent focus:border-[#007AFF]/30"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#007AFF]" size={20} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-[#007AFF] hover:bg-[#006ee6] text-white font-semibold text-[17px] rounded-full shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
            >
              Entrar
            </button>
          </div>
        </form>

        <div className="my-8 flex items-center justify-between">
          <span className="h-px flex-1 bg-slate-200"></span>
          <span className="px-3 text-[13px] font-medium text-slate-400 uppercase tracking-wider">ou</span>
          <span className="h-px flex-1 bg-slate-200"></span>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          <span className="text-[17px] font-semibold text-slate-700">Continuar com Google</span>
        </button>

        <div className="mt-8 text-center">
          <button
            onClick={onSwitchToRegister}
            className="text-[#007AFF] text-[15px] font-medium hover:opacity-80 transition-opacity flex items-center justify-center mx-auto space-x-1"
          >
            <span>Não tem conta? <strong>Cadastre-se</strong></span>
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
