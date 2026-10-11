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
  RefreshCw,
  UserCheck,
  Store,
  Crown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { userService } from '../../services/userService';
import PageHeader from '../../components/PageHeader';
import { Card, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

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

  useEffect(() => {
    loadUsers();
  }, []);

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

  // Metrics
  const metrics = useMemo(() => {
    const total = usersList.length;
    const customers = usersList.filter((u) => !u.role || u.role === 'customer').length;
    const sellers = usersList.filter((u) => u.role === 'seller').length;
    const admins = usersList.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;
    return { total, customers, sellers, admins };
  }, [usersList]);

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
    <div className="space-y-6">
      {/* Header Banner */}
      <PageHeader
        title="Registered Platform Users"
        subtitle="Manage student engineers, verified component sellers, and platform administrators"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Users' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={loadUsers}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh Users
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={metrics.total}
          icon={UsersIcon}
          accentColor="blue"
          description="Accounts registered"
        />
        <StatCard
          title="Students & Customers"
          value={metrics.customers}
          icon={UserCheck}
          accentColor="cyan"
          description="Active makers"
        />
        <StatCard
          title="Component Sellers"
          value={metrics.sellers}
          icon={Store}
          accentColor="orange"
          description="Hardware vendors"
        />
        <StatCard
          title="Administrators"
          value={metrics.admins}
          icon={Crown}
          accentColor="purple"
          description="Staff & management"
        />
      </div>

      {/* Search & Filters */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, college, or branch..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          {/* Role Filters */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
            {['all', 'customer', 'seller', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setRoleFilter(role);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                  roleFilter === role
                    ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">College / Branch</th>
                <th className="py-3.5 px-4">Role Assignment</th>
                <th className="py-3.5 px-4">Member Since</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="w-36 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-28 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <EmptyState
                      icon={UsersIcon}
                      title="No users found"
                      description="No registered user matches the search criteria or role filter."
                    />
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const initial = (u.name || u.email || 'U').charAt(0).toUpperCase();
                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-brand-primary dark:text-blue-400 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/50">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {u.name || 'Unnamed Maker'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* College & Branch */}
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <GraduationCap className="w-4 h-4 text-brand-primary dark:text-blue-400 shrink-0" />
                          <span>
                            {u.college || 'Engineering College'} {u.branch ? `(${u.branch})` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="p-4">
                        <select
                          value={u.role || 'customer'}
                          onChange={(e) => handleRoleChangeRequest(u, e.target.value)}
                          className={`bg-slate-50 dark:bg-slate-900 border text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none transition-colors cursor-pointer ${
                            u.role === 'admin' || u.role === 'super_admin'
                              ? 'border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40'
                              : u.role === 'seller'
                              ? 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <option value="customer">Customer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => router.push(`/users/${u._id}`)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                            title="View User Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ open: true, user: u, loading: false })}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredUsers.length)} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-900 dark:text-slate-100 px-2 tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Role Change Confirmation Modal */}
      <Modal
        open={roleModal.open}
        onClose={() => setRoleModal({ open: false, user: null, newRole: '', loading: false })}
        title="Update User Security Role"
        description="Changing a user's role affects their dashboard access and platform permissions."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Target User: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {roleModal.user?.name}
            </span>{' '}
            <span className="text-xs text-slate-400">({roleModal.user?.email})</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Change role from</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
              {roleModal.user?.role || 'customer'}
            </span>
            <span>to</span>
            <Badge variant="primary" size="sm">
              {roleModal.newRole}
            </Badge>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="md"
              disabled={roleModal.loading}
              onClick={() => setRoleModal({ open: false, user: null, newRole: '', loading: false })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={roleModal.loading}
              onClick={executeRoleChange}
              icon={Shield}
            >
              Confirm Role Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null, loading: false })}
        title="Delete User Account?"
        description="This action will permanently delete the user account from the system."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
            <span className="text-slate-500 dark:text-slate-400">User: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {deleteModal.user?.name}
            </span>{' '}
            <span className="text-xs text-slate-400">({deleteModal.user?.email})</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="md"
              disabled={deleteModal.loading}
              onClick={() => setDeleteModal({ open: false, user: null, loading: false })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={deleteModal.loading}
              onClick={executeDelete}
              icon={Trash2}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
