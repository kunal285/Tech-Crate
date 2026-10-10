'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users as UsersIcon,
  Eye,
  Trash2,
  GraduationCap,
  Search,
  Shield,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react';
import { userService } from '../../services/userService';

const ITEMS_PER_PAGE = 10;

export default function Users() {
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Confirmation Modals
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, loading: false });
  const [roleModal, setRoleModal] = useState({ open: false, user: null, newRole: '', loading: false });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[Load Users Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChangeRequest = (user, newRole) => {
    if (user.role === newRole) return;
    setRoleModal({ open: true, user, newRole, loading: false });
  };

  const executeRoleChange = async () => {
    if (!roleModal.user?._id) return;
    setRoleModal((prev) => ({ ...prev, loading: true }));
    try {
      await userService.updateUserRole(roleModal.user._id, roleModal.newRole);
      setUsersList((prev) =>
        prev.map((u) => (u._id === roleModal.user._id ? { ...u, role: roleModal.newRole } : u))
      );
      setRoleModal({ open: false, user: null, newRole: '', loading: false });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update user role');
      setRoleModal({ open: false, user: null, newRole: '', loading: false });
    }
  };

  const executeDelete = async () => {
    if (!deleteModal.user?._id) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await userService.deleteUser(deleteModal.user._id);
      setUsersList((prev) => prev.filter((u) => u._id !== deleteModal.user._id));
      setDeleteModal({ open: false, user: null, loading: false });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete user');
      setDeleteModal({ open: false, user: null, loading: false });
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.branch?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usersList, searchTerm, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Registered Platform Users</h1>
          <p className="text-sm text-slate-400">View and manage student makers, sellers, and administrators</p>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Users
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, college, or branch..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          {['all', 'customer', 'seller', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => {
                setRoleFilter(role);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                roleFilter === role ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                <th className="p-4">User Details</th>
                <th className="p-4">College / Branch</th>
                <th className="p-4">Role Assignment</th>
                <th className="p-4">Member Since</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="w-32 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-800 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 text-sm">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/50 transition-all">
                    {/* User Info */}
                    <td className="p-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>

                    {/* College & Branch */}
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-1.5 text-xs">
                        <GraduationCap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>{u.college || 'Engineering College'} {u.branch ? `(${u.branch})` : ''}</span>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="p-4">
                      <select
                        value={u.role || 'customer'}
                        onChange={(e) => handleRoleChangeRequest(u, e.target.value)}
                        className={`bg-slate-900 border text-xs font-semibold rounded-lg p-2 focus:outline-none ${
                          u.role === 'admin'
                            ? 'border-purple-500/40 text-purple-300'
                            : u.role === 'seller'
                            ? 'border-amber-500/40 text-amber-300'
                            : 'border-slate-800 text-cyan-400'
                        }`}
                      >
                        <option value="customer">Customer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    {/* Created Date */}
                    <td className="p-4 text-xs text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => router.push(`/users/${u._id}`)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        title="View User Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, user: u, loading: false })}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredUsers.length)} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-white px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Confirmation Modal */}
      {roleModal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-cyan-400">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Update User Role</h3>
                <p className="text-xs text-slate-400">Privilege & security access change</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Change role for <span className="font-semibold text-white">{roleModal.user?.name}</span> from{' '}
              <span className="text-slate-400 font-semibold">{roleModal.user?.role}</span> to{' '}
              <span className="text-cyan-400 font-bold uppercase">{roleModal.newRole}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={roleModal.loading}
                onClick={() => setRoleModal({ open: false, user: null, newRole: '', loading: false })}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={roleModal.loading}
                onClick={executeRoleChange}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20"
              >
                {roleModal.loading ? 'Updating...' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete User Account?</h3>
                <p className="text-xs text-slate-400">This action will remove the user permanently.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">{deleteModal.user?.name}</span> ({deleteModal.user?.email})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={deleteModal.loading}
                onClick={() => setDeleteModal({ open: false, user: null, loading: false })}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={deleteModal.loading}
                onClick={executeDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20"
              >
                {deleteModal.loading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
