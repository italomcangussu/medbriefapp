import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Activity, Server } from 'lucide-react';
import { DashboardStats } from '../../types';

interface AdminOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Carregando métricas...</div>;
  }

  const cards = [
    { label: 'Resumos Gerados', value: stats.totalSummaries, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Usuários Ativos', value: stats.activeUsers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tempo Médio', value: stats.averageTime, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Status Sistema', value: stats.serverStatus, icon: Server, color: stats.serverStatus === 'online' ? 'text-green-600' : 'text-red-600', bg: 'bg-slate-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.bg} ${card.color}`}>
              <card.icon size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{card.label}</p>
              <h3 className={`text-2xl font-bold ${typeof card.value === 'string' && card.value === 'online' ? 'text-green-600 uppercase text-lg' : 'text-slate-900'}`}>
                {card.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Fluxo de Requisições</h3>
        <div className="h-40 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
          <p className="text-slate-400 text-sm">Gráfico de atividade do n8n (Placeholder)</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;