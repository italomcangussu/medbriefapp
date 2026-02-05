import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Share } from '@capacitor/share';

interface ResultDisplayProps {
  content: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'MedBrief Resumo',
        text: content,
        dialogTitle: 'Compartilhar Resumo',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MedBrief Resumo</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
                title="Compartilhar resumo"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
                title="Copiar texto"
              >
                {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              </button>
            </div>
        </div>
        <div className="p-6 prose prose-slate prose-sm sm:prose-base max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
               // Custom styling for specific markdown elements if needed
               h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4" {...props} />,
               h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold text-blue-700 mt-6 mb-3 border-b border-blue-100 pb-2" {...props} />,
               p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-slate-700" {...props} />,
               li: ({node, ...props}) => <li className="mb-1 text-slate-700" {...props} />,
               strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultDisplay;