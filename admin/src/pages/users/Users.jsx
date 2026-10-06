import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, Eye, Trash2, GraduationCap } from 'lucide-react';
import { userService } from '../../services/userService';

export default function Users() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsersList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    await userService.updateUserRole(id, role);
    loadUsers();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this user?')) {
      await userService.deleteUser(id);
      loadUsers();
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Registered Platform Users</h1>
        <p className="text-sm text-slate-400">View and manage engineering students, makers, and admin roles</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">User</th>
              <th className="p-4">College / Branch</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {usersList.map((u) => (
              <tr key={u._id} className="hover:bg-slate-900/50 transition-all">
                <td className="p-4">
                  <div className="font-semibold text-white">{u.name}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </td>
                <td className="p-4 text-slate-300">
                  <div className="flex items-center gap-1.5 text-xs">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <span>{u.college || 'IIT Bombay'} ({u.branch || 'ECE'})</span>
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
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/users/${u._id}`)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
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
