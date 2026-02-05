import React from 'react';
import { SystemLog } from '../../types';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface AdminLogsProps {
  logs: SystemLog[];
}

const AdminLogs: React.FC<AdminLogsProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-4 font-mono text-sm h-[500px] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <h3 className="text-slate-300 font-bold">System Output</h3>
        <span className="flex items-center text-xs text-green-500">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Live Connection
        </span>
      </div>
      
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start group">
            <span className="text-slate-500 min-w-[80px] text-xs pt-0.5">{log.timestamp}</span>
            <div className="flex-1 ml-2">
              <div className="flex items-center mb-0.5">
                 {log.status === 'error' && <AlertCircle size={12} className="text-red-500 mr-2" />}
                 {log.status === 'success' && <CheckCircle2 size={12} className="text-green-500 mr-2" />}
                 {log.status === 'warning' && <Clock size={12} className="text-amber-500 mr-2" />}
                 <span className={`font-semibold ${
                   log.status === 'error' ? 'text-red-400' : 
                   log.status === 'success' ? 'text-green-400' : 'text-amber-400'
                 }`}>
                   {log.action}
                 </span>
              </div>
              <p className="text-slate-400 text-xs pl-5 border-l border-slate-800 group-hover:border-slate-700 transition-colors">
                {log.details}
              </p>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
            <p className="text-slate-600 italic">... Waiting for logs ...</p>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;