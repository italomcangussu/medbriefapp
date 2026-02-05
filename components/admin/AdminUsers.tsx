import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Shield, User, Ban, CheckCircle } from 'lucide-react';
import { AdminUser } from '../../types';

interface AdminUsersProps {
  users: AdminUser[];
  onToggleStatus: (userId: string, currentStatus: string) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users, onToggleStatus }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Usuário</th>
              <th className="px-6 py-4 font-semibold text-slate-600 hidden sm:table-cell">Role</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <motion.tr 
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-3">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                      <Shield size={12} className="mr-1" /> Admin
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs">Usuário</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onToggleStatus(user.id, user.status)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.status === 'active' 
                      ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' 
                      : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={user.status === 'active' ? "Bloquear" : "Ativar"}
                  >
                    {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <div className="p-8 text-center text-slate-400 text-sm">Nenhum usuário encontrado.</div>
      )}
    </div>
  );
};

export default AdminUsers;