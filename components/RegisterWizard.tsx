import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowLeft, ChevronRight, Check, Shield, AlertCircle } from 'lucide-react';
import { UserData } from '../types';
import LegalModal from './LegalModal';
import { TERMS_OF_USE_TEXT, PRIVACY_POLICY_TEXT } from '../constants';
import { supabase } from '../services/supabaseClient';

interface RegisterWizardProps {
  onComplete: () => void;
  onBackToLogin: () => void;
}

const RegisterWizard: React.FC<RegisterWizardProps> = ({ onComplete, onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    acceptedTerms: false
  });
  const [error, setError] = useState<string | null>(null);

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // iOS Spring Animation
  const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 };
  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0 }),
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const initializeGoogleInfo = () => {
        if (step === 1 && window.google && googleBtnRef.current) {
            try {
                if (googleBtnRef.current.innerHTML !== "") return;

                window.google.accounts.id.initialize({
                client_id: '61634379849-8j8c85jik4v7hfl6ij9qc42a6qi8da0d.apps.googleusercontent.com',
                callback: handleGoogleCredentialResponse,
                auto_select: false
                });

                window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                shape: 'pill',
                text: 'signup_with',
                logo_alignment: 'left',
                width: googleBtnRef.current.clientWidth || 320
                });
            } catch (err) {
                console.error("Google Auth Init Error", err);
            }
        }
    };

    if (step === 1) {
        initializeGoogleInfo();
        timer = setInterval(() => {
            if (window.google) {
                initializeGoogleInfo();
                clearInterval(timer);
            }
        }, 500);
    }

    return () => {
        if (timer) clearInterval(timer);
    };
  }, [step]);

  const handleGoogleCredentialResponse = (response: any) => {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    setFormData(prev => ({ 
      ...prev, 
      email: payload.email || "", 
      name: payload.name || "Google User" 
    }));
    setStep(2);
    setDirection(1);
  };

  const handleNext = () => {
    setError(null);
    let hasError = false;

    if (step === 1) {
        if (!formData.email || !formData.password) {
            setError("Preencha e-mail e senha.");
            hasError = true;
        } else if (!formData.email.includes('@')) {
            setError("E-mail inválido.");
            hasError = true;
        } else if (formData.password.length < 6) {
            setError("Senha curta (min. 6).");
            hasError = true;
        }
    } else if (step === 2) {
        if (!formData.name || !formData.phone) {
            setError("Preencha todos os dados.");
            hasError = true;
        }
    }

    if (hasError) return;
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setDirection(-1);
    if (step === 1) onBackToLogin();
    else setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.acceptedTerms) {
      setError("Aceite os termos.");
      return;
    }

    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password || '',
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            accepted_terms_at: new Date().toISOString()
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        onComplete();
      } else {
        setError("Conta criada. Verifique seu e-mail para confirmar antes de fazer login.");
      }
    } catch (err: any) {
      console.error("SignUp Error:", err);
      setError(err.message || "Falha ao criar conta.");
    }
  };

  const updateFormData = (field: keyof UserData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (error) setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[85vh] pt-6 px-4 pb-4">
      <div className="w-full max-w-[380px] flex flex-col h-full">
        
        {/* iOS Segmented Control Style Progress */}
        <div className="flex justify-between items-center mb-8 bg-slate-200/50 p-1 rounded-xl">
          {[1, 2, 3].map((s) => (
            <div 
                key={s} 
                className={`flex-1 h-1.5 mx-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#007AFF]' : 'bg-slate-300/50'}`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="mb-4 text-[#007AFF] flex items-center text-[15px] font-medium hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={18} className="mr-1" strokeWidth={2.5} />
            Voltar
          </button>
          <motion.div
             key={step}
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-1"
          >
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {step === 1 && "Criar Conta"}
                {step === 2 && "Dados Pessoais"}
                {step === 3 && "Termos"}
            </h2>
            <p className="text-[15px] text-slate-500 font-medium">
                Passo {step} de 3
            </p>
          </motion.div>
        </div>

        <div className="flex-1 flex flex-col relative">
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50/80 backdrop-blur-md text-red-600 px-4 py-3 rounded-2xl flex items-center text-[13px] font-semibold mb-4 border border-red-100"
                    >
                        <AlertCircle size={16} className="mr-2 shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence initial={false} custom={direction} mode="wait">
              {step === 1 && (
                <motion.div key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={springTransition} className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="relative group">
                      <input type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} placeholder="E-mail"
                        className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-[17px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all duration-300 outline-none" />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#007AFF]" size={20} strokeWidth={2} />
                    </div>
                    <div className="relative group">
                      <input type="password" value={formData.password} onChange={(e) => updateFormData('password', e.target.value)} placeholder="Senha (min. 6 caracteres)"
                        className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-[17px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all duration-300 outline-none" />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#007AFF]" size={20} strokeWidth={2} />
                    </div>
                  </div>

                  <div className="my-6 flex items-center justify-between">
                    <span className="h-px flex-1 bg-slate-200"></span>
                    <span className="px-3 text-[13px] font-medium text-slate-400 uppercase tracking-wider">ou</span>
                    <span className="h-px flex-1 bg-slate-200"></span>
                  </div>
                  
                  <div className="w-full flex justify-center h-[50px]">
                       <div ref={googleBtnRef} className="w-full"></div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={springTransition} className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="relative group">
                      <input type="text" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} placeholder="Nome Completo"
                        className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-[17px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all duration-300 outline-none" />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#007AFF]" size={20} strokeWidth={2} />
                    </div>
                    <div className="relative group">
                      <input type="tel" value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} placeholder="Telefone"
                        className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-[17px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all duration-300 outline-none" />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#007AFF]" size={20} strokeWidth={2} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={springTransition} className="space-y-6 w-full">
                   <div className="bg-blue-50 p-5 rounded-[20px] flex items-start">
                        <Shield className="text-[#007AFF] shrink-0 mt-0.5 mr-3" size={24} strokeWidth={1.5} />
                        <p className="text-[14px] font-medium text-blue-900 leading-relaxed">
                            Para sua segurança e conformidade (HIPAA/LGPD), aceite os termos abaixo.
                        </p>
                   </div>

                   {/* iOS Inset Grouped List Item */}
                   <div 
                      onClick={() => updateFormData('acceptedTerms', !formData.acceptedTerms)}
                      className={`group flex items-center justify-between p-5 rounded-[20px] bg-white border cursor-pointer transition-all active:scale-[0.98] ${
                       formData.acceptedTerms ? 'border-[#007AFF] shadow-sm ring-1 ring-[#007AFF]' : 'border-slate-200 hover:border-slate-300'
                   }`}>
                        <div className="flex-1 pr-4">
                             <h4 className="font-semibold text-slate-900 mb-1">Concordo com os Termos</h4>
                             <p className="text-[13px] text-slate-500 leading-snug">
                                Li o <span className="text-[#007AFF] font-semibold underline decoration-2 underline-offset-2" onClick={(e) => { e.stopPropagation(); setShowTerms(true); }}>Termos de Uso</span> e <span className="text-[#007AFF] font-semibold underline decoration-2 underline-offset-2" onClick={(e) => { e.stopPropagation(); setShowPrivacy(true); }}>Privacidade</span>.
                             </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            formData.acceptedTerms ? 'bg-[#007AFF] border-[#007AFF]' : 'border-slate-300'
                        }`}>
                            {formData.acceptedTerms && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* Floating Action Button area */}
        <div className="mt-8 pt-4 pb-4 bg-transparent">
             <button
                onClick={step === 3 ? handleSubmit : handleNext}
                className="w-full py-4 bg-[#007AFF] hover:bg-[#006ee6] text-white font-semibold text-[17px] rounded-full shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
             >
                <span>{step === 3 ? 'Criar Conta' : 'Continuar'}</span>
                {step !== 3 && <ChevronRight size={18} strokeWidth={2.5} />}
             </button>
        </div>
      </div>

      <LegalModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Termos de Uso" content={TERMS_OF_USE_TEXT} />
      <LegalModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacidade" content={PRIVACY_POLICY_TEXT} />
    </div>
  );
};

export default RegisterWizard;
