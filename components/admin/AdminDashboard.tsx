import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, ScrollText, Settings as SettingsIcon, LogOut, RefreshCw } from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminLogs from './AdminLogs';
import SettingsModal from '../SettingsModal';
import { adminRequest } from '../../services/adminApi';
import { AppSettings, DashboardStats, AdminUser, SystemLog } from '../../types';

interface AdminDashboardProps {
  onLogout: () => void;
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, settings, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs'>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
        const webhook = settings.adminWebhookUrl || settings.webhookUrl;
        
        // Fetch based on active tab to save resources, or fetch all if Overview
        const statsData = await adminRequest(webhook, 'get_stats');
        setStats(statsData.stats || null);

        if (activeTab === 'users' || activeTab === 'overview') {
            const usersData = await adminRequest(webhook, 'get_users');
            setUsers(usersData.users || []);
        }

        if (activeTab === 'logs') {
            const logsData = await adminRequest(webhook, 'get_logs');
            setLogs(logsData.logs || []);
        }

    } catch (e) {
        console.error("Failed to fetch admin data", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const handleUserStatusToggle = async (userId: string, currentStatus: string) => {
    // Optimistic Update
    setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: currentStatus === 'active' ? 'blocked' : 'active' } : u
    ));

    // Call API
    try {
        await adminRequest(settings.adminWebhookUrl || settings.webhookUrl, 'ban_user', { userId, status: currentStatus === 'active' ? 'blocked' : 'active' });
    } catch (e) {
        console.error("Failed to update user status");
        // Revert on error would go here
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'logs', label: 'Logs Sistema', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Mobile / Desktop */}
      <aside className="bg-white border-b md:border-b-0 md:border-r border-slate-200 w-full md:w-64 flex-shrink-0 z-30">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between md:block">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm">MB</span>
                Admin
            </h1>
            <button className="md:hidden p-2 text-slate-400" onClick={onLogout}>
                <LogOut size={20} />
            </button>
        </div>
        
        <nav className="p-4 space-y-1 overflow-x-auto md:overflow-visible flex md:block">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all w-full mb-1 md:mb-2 whitespace-nowrap ${
                        activeTab === item.id 
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                    <item.icon size={18} className={`mr-3 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    {item.label}
                </button>
            ))}
        </nav>

        <div className="p-4 mt-auto hidden md:block border-t border-slate-100">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors mb-2"
            >
                <SettingsIcon size={18} className="mr-3 text-slate-400" />
                Configurações
            </button>
            <button 
                onClick={onLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
                <LogOut size={18} className="mr-3" />
                Sair
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('overview', 'Visão Geral').replace('users', 'Gerenciar Usuários').replace('logs', 'Logs de Sistema')}</h2>
                <p className="text-sm text-slate-500">Painel de controle MedBrief</p>
            </div>
            <div className="flex space-x-2">
                 <button 
                    onClick={fetchAllData}
                    disabled={isLoading}
                    className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
                 >
                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                 </button>
                 {/* Mobile Settings Trigger */}
                 <button 
                    onClick={() => setIsSettingsOpen(true)} 
                    className="md:hidden p-2 bg-white border border-slate-200 text-slate-500 rounded-lg"
                 >
                    <SettingsIcon size={20} />
                 </button>
            </div>
        </header>

        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'overview' && <AdminOverview stats={stats} loading={isLoading} />}
                {activeTab === 'users' && <AdminUsers users={users} onToggleStatus={handleUserStatusToggle} />}
                {activeTab === 'logs' && <AdminLogs logs={logs} />}
            </motion.div>
        </AnimatePresence>
      </main>
        
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings} 
        onSave={onUpdateSettings} 
      />
    </div>
  );
};

export default AdminDashboard;