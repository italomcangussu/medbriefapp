export interface AppSettings {
  webhookUrl: string;
  adminWebhookUrl?: string; // URL específica para ações administrativas
}

export interface ApiRequestPayload {
  type: 'file' | 'text';
  content: string;
  fileName?: string;
  mimeType?: string;
  id?: string;
  // Admin specific payload extensions
  action?: 'get_stats' | 'get_users' | 'get_logs' | 'ban_user';
  adminKey?: string;
  userId?: string;
}

export interface ApiResponse {
  summary: string;
  // Admin specific response extensions
  stats?: DashboardStats;
  users?: AdminUser[];
  logs?: SystemLog[];
  success?: boolean;
}

export enum InputMode {
  FILE = 'FILE',
  TEXT = 'TEXT'
}

export type AuthView = 'LOGIN' | 'REGISTER' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';

export interface UserData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  acceptedTerms: boolean;
}

// --- Admin Types ---

export interface DashboardStats {
  totalSummaries: number;
  activeUsers: number;
  serverStatus: 'online' | 'maintenance' | 'offline';
  averageTime: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  joinedAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'error' | 'warning';
}

declare global {
  interface Window {
    google: any;
  }
}