import React, { useState } from 'react';
import { SystemLog } from '../../types';
import { AlertCircle, CheckCircle2, Clock, Filter } from 'lucide-react';

interface AdminLogsProps {
  logs: SystemLog[];
}

const AdminLogs: React.FC<AdminLogsProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'error' | 'success' | 'warning'>('all');

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.status === filter);

  return (
    <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-4 font-mono text-sm h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800 shrink-0">
        <h3 className="text-slate-300 font-bold flex items-center">
          System Output
          <span className="ml-2 text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{filteredLogs.length}</span>
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            {(['all', 'success', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-2 py-1 text-xs rounded-md transition-all uppercase ${filter === f
                  ? (f === 'error' ? 'bg-red-500/20 text-red-400' : f === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-white')
                  : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex items-start group">
            <span className="text-slate-600 min-w-[80px] text-xs pt-1">{log.timestamp}</span>
            <div className="flex-1 ml-2 bg-slate-800/30 p-2 rounded border border-transparent group-hover:border-slate-700 transition-colors">
              <div className="flex items-center mb-1">
                {log.status === 'error' && <AlertCircle size={14} className="text-red-500 mr-2" />}
                {log.status === 'success' && <CheckCircle2 size={14} className="text-green-500 mr-2" />}
                {log.status === 'warning' && <Clock size={14} className="text-amber-500 mr-2" />}
                <span className={`font-semibold tracking-wide ${log.status === 'error' ? 'text-red-400' :
                  log.status === 'success' ? 'text-green-400' : 'text-amber-400'
                  }`}>
                  {log.action}
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                {log.details}
              </p>
            </div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600 italic">
            <Filter size={24} className="mb-2 opacity-50" />
            No logs found for filter: {filter}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;