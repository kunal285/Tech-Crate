import React, { useEffect, useState } from 'react';
import { Users, Shield, Trash2, Mail, GraduationCap } from 'lucide-react';
import adminApi from '../services/adminApi';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('Delete this user account permanently?')) {
      try {
        await adminApi.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">User Accounts & Roles</h1>
        <p className="text-sm text-slate-400">Manage students, makers, verified sellers, and admin access</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">User Details</th>
              <th className="p-4">College / Institution</th>
              <th className="p-4">Current Role</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-900/50 transition-all">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-800"
                    />
                    <div>
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">
                  <div className="flex items-center gap-1.5 text-xs">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <span>{u.college || 'IIT Bombay'}</span>
                  </div>
                </td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-cyan-400 font-semibold rounded-lg p-2 focus:outline-none"
                  >
                    <option value="customer">customer</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-4 text-xs text-slate-400">
                  {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
