import { AdminUser, DashboardStats, SystemLog, ApiResponse } from '../types';

// Fallback Mock Data caso o n8n não esteja conectado ainda
const MOCK_STATS: DashboardStats = {
  totalSummaries: 1248,
  activeUsers: 342,
  serverStatus: 'online',
  averageTime: '4.2s'
};

const MOCK_USERS: AdminUser[] = [
  { id: '1', name: 'Dr. Roberto Silva', email: 'roberto@med.com', role: 'admin', status: 'active', joinedAt: '2024-01-15' },
  { id: '2', name: 'Dra. Ana Costa', email: 'ana.costa@hosp.com', role: 'user', status: 'active', joinedAt: '2024-02-10' },
  { id: '3', name: 'Residente João', email: 'joao.res@univ.edu', role: 'user', status: 'blocked', joinedAt: '2024-03-05' },
];

const MOCK_LOGS: SystemLog[] = [
  { id: '101', timestamp: '10:42 AM', action: 'Generate Summary', details: 'PDF: guideline_sepsis.pdf', status: 'success' },
  { id: '102', timestamp: '10:38 AM', action: 'Auth Error', details: 'Failed login attempt IP 192.168.x.x', status: 'error' },
  { id: '103', timestamp: '09:15 AM', action: 'System Backup', details: 'Daily backup completed', status: 'success' },
];

/**
 * Envia comandos administrativos para o n8n.
 * Espera que o webhook do n8n trate o campo "action" no JSON.
 */
export const adminRequest = async (
  webhookUrl: string, 
  action: 'get_stats' | 'get_users' | 'get_logs' | 'ban_user',
  payload: any = {}
): Promise<any> => {
  
  // Se não houver URL configurada, retorna dados mockados para desenvolvimento
  if (!webhookUrl || webhookUrl === '') {
    console.warn("⚠️ Admin Webhook URL not set. Using mock data.");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simula delay de rede

    switch (action) {
      case 'get_stats': return { stats: MOCK_STATS };
      case 'get_users': return { users: MOCK_USERS };
      case 'get_logs': return { logs: MOCK_LOGS };
      case 'ban_user': return { success: true };
      default: return {};
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': 'medbrief-secret-admin-key' // Idealmente viria de env var ou settings
      },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        ...payload
      }),
    });

    if (!response.ok) {
      throw new Error(`Admin API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Admin API Request Failed:", error);
    throw error;
  }
};