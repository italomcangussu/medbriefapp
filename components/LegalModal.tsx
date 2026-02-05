import React from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* iOS Page Sheet Card */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) onClose();
            }}
            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col h-[92vh] sm:h-[80vh] overflow-hidden"
          >
            {/* Grabber Handle */}
            <div className="w-full flex justify-center pt-3 pb-2 bg-white flex-shrink-0" onClick={onClose}>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2 pb-4 border-b border-slate-100/50 bg-white z-10">
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">{title}</h2>
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 text-slate-400 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 prose prose-slate prose-sm sm:prose-base leading-relaxed">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>

            {/* Footer Action */}
            <div className="p-6 pt-4 border-t border-slate-50 bg-white safe-area-bottom">
              <button
                onClick={onClose}
                className="w-full py-4 bg-[#007AFF] hover:bg-[#006ee6] text-white text-[17px] font-semibold rounded-full shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalModal;