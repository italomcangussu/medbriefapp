import React, { useState, useEffect } from 'react';
import { FileText, UploadCloud, Link as LinkIcon, AlertCircle, ArrowRight, LogOut } from 'lucide-react';
import { AppSettings, InputMode, AuthView } from './types';
import { DEFAULT_WEBHOOK_URL, STORAGE_KEY_SETTINGS, STORAGE_KEY_AUTH_MODE } from './constants';

import LoadingDNA from './components/LoadingDNA';
import ResultDisplay from './components/ResultDisplay';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import RegisterWizard from './components/RegisterWizard';
import { sendToWebhook } from './services/n8nService';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './services/supabaseClient';
import { extractTextFromPdf } from './services/pdfExtractor';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('LOGIN');
  const [userId, setUserId] = useState<string | null>(null);

  // App State
  const [settings, setSettings] = useState<AppSettings>({ webhookUrl: DEFAULT_WEBHOOK_URL });

  const [inputMode, setInputMode] = useState<InputMode>(InputMode.FILE);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Inputs
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleLoginSuccess = (mode: 'USER' | 'ADMIN') => {
    localStorage.setItem(STORAGE_KEY_AUTH_MODE, mode);
    setIsAuthenticated(true);
    setAuthView(mode === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'LOGIN');
  };

  // Load settings & auth on mount
  useEffect(() => {
    // 1. Load Settings
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    // 2. Check Auth Strategy
    const checkAuth = async () => {
      const savedAuthMode = localStorage.getItem(STORAGE_KEY_AUTH_MODE);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);

        if (savedAuthMode === 'ADMIN') {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role,status')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError || !profile || profile.role !== 'admin' || profile.status !== 'active') {
            await supabase.auth.signOut();
            localStorage.removeItem(STORAGE_KEY_AUTH_MODE);
            setIsAuthenticated(false);
            setAuthView('LOGIN');
            setUserId(null);
            return;
          }

          setAuthView('ADMIN_DASHBOARD');
        }
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        localStorage.removeItem(STORAGE_KEY_AUTH_MODE);
      }
    };

    checkAuth();

    // Listen for Supabase auth changes (e.g. token refresh or sign out in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem(STORAGE_KEY_AUTH_MODE);
        setIsAuthenticated(false);
        setAuthView('LOGIN');
        setUserId(null);
      }

      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        setUserId(session?.user?.id ?? null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth Handlers
  const handleLogin = () => {
    handleLoginSuccess('USER');
  };

  const handleAdminLoginSuccess = () => {
    handleLoginSuccess('ADMIN');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY_AUTH_MODE);

    setIsAuthenticated(false);
    setAuthView('LOGIN');
    setResult(null);
    setSelectedFile(null);
    setTextInput('');
    setUserId(null);
  };

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
  };

  // Main App Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    if (!settings.webhookUrl) {
      setError("Por favor, entre em contato com o administrador para configurar o sistema.");
      return;
    }
    if (inputMode === InputMode.FILE && !selectedFile) {
      setError("Selecione um arquivo PDF para enviar.");
      return;
    }
    if (inputMode === InputMode.TEXT && !textInput.trim()) {
      setError("Insira o texto ou link para enviar.");
      return;
    }

    setIsLoading(true);
    const inputTextValue = inputMode === InputMode.TEXT ? textInput.trim() : null;
    const inputFileName = inputMode === InputMode.FILE ? selectedFile?.name || null : null;
    const inputMimeType = inputMode === InputMode.FILE ? selectedFile?.type || null : null;
    let summaryId: string | null = null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userId || user?.id || null;
      if (!currentUserId) throw new Error("Usuário não autenticado.");

      // 1. Create DB Record (Processing)
      const { data: summaryRow, error: insertError } = await supabase
        .from('summaries')
        .insert({
          user_id: currentUserId,
          input_type: inputMode === InputMode.FILE ? 'file' : 'text',
          input_text: inputTextValue, // Will be filled by Edge Function if FILE
          file_name: inputFileName,
          mime_type: inputMimeType,
          status: 'processing'
        })
        .select('id')
        .single();

      if (insertError) throw new Error("Falha ao criar registro.");
      summaryId = summaryRow.id;

      // 2. Setup Realtime Listener (Async Wait)
      // We keep this same logic as before to listen for N8N completion
      const channel = supabase
        .channel(`summary-${summaryId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'summaries',
            filter: `id=eq.${summaryId}`
          },
          (payload) => {
            const newRow = payload.new as any;
            if (newRow.status === 'completed' && newRow.summary_text) {
              setResult(newRow.summary_text);
              setIsLoading(false);
              supabase.removeChannel(channel);
            } else if (newRow.status === 'failed') {
              setError(newRow.error_message || "Falha no processamento remoto.");
              setIsLoading(false);
              supabase.removeChannel(channel);
            }
          }
        )
        .subscribe();

      // 3. Fallback Polling (Safety Net)
      const pollInterval = setInterval(async () => {
        const { data: pollData } = await supabase
          .from('summaries')
          .select('status, summary_text, error_message')
          .eq('id', summaryId as string)
          .single();

        if (pollData) {
          if (pollData.status === 'completed' && pollData.summary_text) {
            setResult(pollData.summary_text);
            setIsLoading(false);
            clearInterval(pollInterval);
            supabase.removeChannel(channel);
          } else if (pollData.status === 'failed') {
            setError(pollData.error_message || "Falha.");
            setIsLoading(false);
            clearInterval(pollInterval);
            supabase.removeChannel(channel);
          }
        }
      }, 4000);


      // 4. Handle CONTENT processing
      let finalContentForN8N = '';

      const isUrl = (str: string) => {
        try {
          new URL(str);
          return true;
        } catch {
          return false;
        }
      };

      if (inputMode === InputMode.FILE && selectedFile) {
        // A) PDF FLOW: Extract text locally in browser using PDF.js
        console.log("Extracting PDF text locally...");

        try {
          finalContentForN8N = await extractTextFromPdf(selectedFile);
          console.log("PDF extracted, text length:", finalContentForN8N.length);
        } catch (pdfError) {
          console.error("PDF Extraction Error:", pdfError);
          throw new Error("Falha ao extrair texto do PDF.");
        }

      } else if (inputMode === InputMode.TEXT && isUrl(textInput.trim())) {
        // B) URL FLOW: Edge Function -> Scrape -> Text
        console.log("URL detected, scraping...");
        const targetUrl = textInput.trim();

        const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-url', {
          body: { record_id: summaryId, url: targetUrl }
        });

        if (scrapeError || !scrapeData?.text) {
          console.error("Scraping Error:", scrapeError || "No text returned");
          // Fallback: If scraping fails, send the URL itself to N8N as a fallback (some workflows might handle it)
          // But for now let's error out or warn.
          // Let's fallback to sending the URL string so N8N knows at least something.
          console.warn("Scraping failed, sending raw URL.");
          finalContentForN8N = targetUrl;
        } else {
          finalContentForN8N = scrapeData.text;
        }

      } else {
        // C) RAW TEXT FLOW: Use input directly
        finalContentForN8N = textInput;
      }

      // 5. Trigger N8N (Now typically sending TEXT, not File)
      // We send type='text' because we already extracted it, even if source was file.
      // This makes N8N lighter.
      await sendToWebhook(settings.webhookUrl, {
        type: 'text', // IMPORTANT: We force 'text' type now because we extracted it!
        content: finalContentForN8N,
        fileName: inputFileName || undefined, // Keep metadata
        mimeType: inputMimeType || undefined,
        id: summaryId || undefined
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao processar.");
      setIsLoading(false);
      if (summaryId) {
        await supabase.from('summaries').update({ status: 'failed', error_message: err.message }).eq('id', summaryId);
      }
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  // -------------------------
  // RENDER: Admin Dashboard
  // -------------------------
  if (isAuthenticated && authView === 'ADMIN_DASHBOARD') {
    return (
      <AdminDashboard
        onLogout={handleLogout}
        settings={settings}
        onUpdateSettings={handleSaveSettings}
      />
    );
  }

  // -------------------------
  // RENDER: Auth Flows
  // -------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100 to-transparent pointer-events-none" />
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

        <header className="relative z-10 pt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20">
              <FileText size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MedBrief</h1>
          </div>
        </header>

        <main className="flex-1 relative z-10">
          <AnimatePresence mode="wait">
            {authView === 'LOGIN' && (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Login
                  onLogin={handleLogin}
                  onSwitchToRegister={() => setAuthView('REGISTER')}
                  onAdminMode={() => setAuthView('ADMIN_LOGIN')}
                />
              </motion.div>
            )}
            {authView === 'REGISTER' && (
              <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RegisterWizard
                  onComplete={handleLogin}
                  onBackToLogin={() => setAuthView('LOGIN')}
                />
              </motion.div>
            )}
            {authView === 'ADMIN_LOGIN' && (
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminLogin
                  onLogin={handleAdminLoginSuccess}
                  onBack={() => setAuthView('LOGIN')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // -------------------------
  // RENDER: User Main App
  // -------------------------
  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2" onClick={handleReset} role="button">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <FileText size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">MedBrief</h1>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Sair"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 pb-24">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center min-h-[50vh]"
            >
              <LoadingDNA />
            </motion.div>
          ) : result ? (
            // Result View
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <ResultDisplay content={result} />
              <button
                onClick={handleReset}
                className="w-full py-4 bg-white border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                Analisar Novo Artigo
              </button>
            </motion.div>
          ) : (
            // Input View
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Tabs */}
              <div className="flex bg-slate-200 p-1 rounded-xl">
                <button
                  onClick={() => setInputMode(InputMode.FILE)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${inputMode === InputMode.FILE
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <span className="flex items-center justify-center">
                    <UploadCloud size={18} className="mr-2" />
                    Arquivo PDF
                  </span>
                </button>
                <button
                  onClick={() => setInputMode(InputMode.TEXT)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${inputMode === InputMode.TEXT
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <span className="flex items-center justify-center">
                    <LinkIcon size={18} className="mr-2" />
                    Texto / Link
                  </span>
                </button>
              </div>

              {/* Input Area */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[300px] flex flex-col justify-center">
                {inputMode === InputMode.FILE ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 w-full px-4">
                      <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="mb-2 text-sm text-slate-600 font-medium w-full truncate text-center">
                        {selectedFile ? selectedFile.name : "Toque para selecionar o PDF"}
                      </p>
                      <p className="text-xs text-slate-400">PDF até 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Cole o texto do artigo, resumo ou link aqui..."
                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-700 placeholder:text-slate-400"
                  />
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-700 text-sm"
                >
                  <AlertCircle size={18} className="mr-2 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSubmit}
                disabled={(!selectedFile && inputMode === InputMode.FILE) || (!textInput && inputMode === InputMode.TEXT)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center text-lg"
              >
                Gerar Briefing
                <ArrowRight size={20} className="ml-2" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
};

export default App;
