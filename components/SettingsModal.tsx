import React, { useState, useEffect } from 'react';
import { X, Save, ExternalLink } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [url, setUrl] = useState(settings.webhookUrl);

  useEffect(() => {
    setUrl(settings.webhookUrl);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ webhookUrl: url });
    onClose();
  };

  const currentCallbackUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Configurações</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Webhook URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              n8n Webhook URL (POST)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://n8n.seu-servidor.com/webhook/..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-slate-600"
            />
            <p className="mt-2 text-xs text-slate-400">
              O app enviará um JSON contendo <code>type</code> e <code>content</code> para este endpoint.
            </p>
          </div>

          {/* Callback URL Info */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              App Callback URL
            </label>
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                <code className="text-xs text-slate-600 break-all">{currentCallbackUrl}</code>
            </div>
          </div>

          {/* Documentation Link */}
          <div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()} // Placeholder link
              className="inline-flex items-center text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Ver Documentação da API
            </a>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Save size={18} className="mr-2" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;