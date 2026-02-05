import { DashboardStats } from '../types';

// Fallback Mock Data caso o n8n não esteja conectado ainda ou falhe
const MOCK_STATS: DashboardStats = {
  totalSummaries: 0,
  activeUsers: 0,
  serverStatus: 'offline', // Default to offline if no data
  averageTime: '-'
};

/**
 * Envia comandos administrativos para o n8n.
 * Espera que o webhook do n8n trate o campo "action" no JSON.
 */
export const adminRequest = async (
  webhookUrl: string,
  action: 'get_stats' | 'get_users' | 'get_logs' | 'ban_user',
  payload: any = {}
): Promise<any> => {

  // Validation
  if (!webhookUrl || webhookUrl.trim() === '') {
    console.warn("⚠️ Admin Webhook URL not set. Returning empty/mock data.");
    // Return safe empty defaults instead of throwing hard errors to prevent UI crash
    switch (action) {
      case 'get_stats': return { stats: MOCK_STATS };
      case 'get_users': return { users: [] };
      case 'get_logs': return { logs: [] };
      case 'ban_user': return { success: false, message: 'No webhook configured' };
      default: return {};
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-Admin-Key': settings.adminKey // We might need to pass this if we implement secure headers in future
      },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        ...payload
      }),
    });

    if (!response.ok) {
      throw new Error(`Admin API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`Admin API Request Failed [${action}]:`, error);
    // Return empty structures on error to keep UI stable
    if (action === 'get_stats') return { stats: MOCK_STATS };
    if (action === 'get_users') return { users: [] };
    if (action === 'get_logs') return { logs: [] };
    throw error;
  }
};