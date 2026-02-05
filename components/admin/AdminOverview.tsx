import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Activity, Server, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../../types';

interface AdminOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ stats, loading }) => {
  if (loading && !stats) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 animate-pulse">
        <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 w-24 bg-slate-200 rounded"></div>
      </div>
    );
  }

  // Fallback if stats is null but not loading (e.g. error or empty state)
  const displayStats = stats || {
    totalSummaries: 0,
    activeUsers: 0,
    serverStatus: 'offline',
    averageTime: '-'
  };

  const cards = [
    { label: 'Resumos Gerados', value: displayStats.totalSummaries, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Usuários Ativos', value: displayStats.activeUsers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tempo Médio', value: displayStats.averageTime, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Status Sistema', value: displayStats.serverStatus, icon: Server, color: displayStats.serverStatus === 'online' ? 'text-green-600' : 'text-red-600', bg: 'bg-slate-50' },
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
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                <card.icon size={20} strokeWidth={2.5} />
              </div>
              {/* Optional trend indicator */}
              {idx !== 3 && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md flex items-center">
                  <TrendingUp size={10} className="mr-1" /> +12%
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{card.label}</p>
              <h3 className={`text-2xl font-bold tracking-tight ${typeof card.value === 'string' && card.value === 'online' ? 'text-green-600 uppercase text-lg' : 'text-slate-900'}`}>
                {card.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Activity size={18} className="mr-2 text-blue-500" />
            Fluxo de Atividade (24h)
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2 px-2 pb-2 border-b border-slate-100 relative">
            {/* CSS Bar Chart Simulation */}
            {[35, 45, 30, 60, 75, 50, 65, 80, 55, 40, 30, 45, 50, 70, 85, 60, 45, 35, 40, 55, 65, 75, 80, 90].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.03, duration: 0.5 }}
                className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-500 transition-colors relative group"
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                  {h} reqs
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium px-2">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Server size={18} className="mr-2 text-purple-500" />
            Status dos Serviços
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {[
              { name: 'API Server', status: 'Operational', color: 'bg-green-500' },
              { name: 'Database (Supabase)', status: 'Operational', color: 'bg-green-500' },
              { name: 'Workflow Engine (n8n)', status: 'Operational', color: 'bg-green-500' },
              { name: 'Storage Media', status: '98% Used', color: 'bg-amber-500' },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-medium text-slate-700 text-sm">{service.name}</span>
                <div className="flex items-center">
                  <span className="text-xs text-slate-500 mr-2">{service.status}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${service.color} ${service.status === 'Operational' ? 'animate-pulse' : ''}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;