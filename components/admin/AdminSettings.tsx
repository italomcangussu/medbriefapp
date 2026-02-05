import React, { useState } from 'react';
import { AppSettings } from '../../types';
import { Copy, Check, Database, Terminal, AlertCircle } from 'lucide-react';

interface AdminSettingsProps {
    settings: AppSettings;
    onUpdateSettings: (newSettings: AppSettings) => Promise<void>;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onUpdateSettings }) => {
    const [formData, setFormData] = useState<AppSettings>(settings);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [copied, setCopied] = useState(false);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Generate the cURL command for N8N
    const curlCommand = `curl -X PATCH "${supabaseUrl}/rest/v1/summaries?id=eq.{{$json.id}}" \\
-H "apikey: ${anonKey}" \\
-H "Authorization: Bearer ${anonKey}" \\
-H "Content-Type: application/json" \\
-d '{"status": "completed", "summary_text": "{{$json.summary}}"}'`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        try {
            await onUpdateSettings(formData);
            setSuccessMsg('Configurações salvas!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(curlCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start">
                <Database className="text-blue-600 mt-1 mr-4 shrink-0" size={24} />
                <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-1">Integração Simplificada N8N</h3>
                    <p className="text-blue-700 text-sm">
                        Configure abaixo o link do seu workflow para receber os arquivos.<br />
                        Em seguida, copie o comando pronto para fazer o N8N responder ao app.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* WEHOOK INPUT */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800 uppercase tracking-wide">
                        1. Webhook URL (Onde enviar os arquivos?)
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="url"
                            name="webhookUrl"
                            value={formData.webhookUrl}
                            onChange={handleChange}
                            placeholder="https://n8n.seu-servidor.com/webhook/..."
                            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700 font-mono text-sm shadow-sm transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                    {successMsg && <p className="text-green-600 text-sm font-medium animate-pulse">✓ {successMsg}</p>}
                </div>

                <hr className="border-slate-200" />

                {/* CURL GENERATOR */}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center">
                            2. Resposta do N8N (Copie e Cole no Node HTTP Request)
                        </label>
                        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
                                <div className="flex items-center space-x-2">
                                    <Terminal size={14} className="text-slate-400" />
                                    <span className="text-xs font-mono text-slate-400">cURL (PATCH)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="text-xs font-medium text-slate-300 hover:text-white flex items-center bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    {copied ? <Check size={14} className="mr-1.5 text-green-400" /> : <Copy size={14} className="mr-1.5" />}
                                    {copied ? 'Copiado!' : 'Copiar Comando'}
                                </button>
                            </div>
                            <div className="p-4 overflow-x-auto custom-scrollbar">
                                <code className="font-mono text-xs text-green-400 whitespace-pre leading-relaxed block">
                                    {curlCommand}
                                </code>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start">
                        <AlertCircle className="text-amber-600 mt-0.5 mr-3 shrink-0" size={18} />
                        <div className="text-sm text-amber-800">
                            <strong>Erro Comum: "failed to parse filter"</strong><br />
                            Isso acontece se o parâmetro <code>id</code> for enviado sem o prefixo <code>eq.</code>.<br />
                            No n8n, verifique se o campo "Query Parameters" tem:<br />
                            Nome: <code>id</code> <br />
                            Valor: <code>eq.&#123;&#123;$json.id&#125;&#125;</code> (O "eq." é obrigatório!)
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default AdminSettings;
