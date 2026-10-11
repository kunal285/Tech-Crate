'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Calendar,
  Phone,
  ShieldCheck,
  AlertCircle,
  Building,
} from 'lucide-react';
import { userService } from '../../services/userService';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function UserDetails() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserById(id);
      setUser(data);
    } catch (err) {
      console.error('[Load User Error]', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <Card className="h-64 animate-pulse p-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="p-12 text-center max-w-xl mx-auto">
        <EmptyState
          icon={AlertCircle}
          title="User Record Not Found"
          description="The user account record could not be retrieved from the database."
          action={
            <Button variant="outline" size="sm" onClick={() => router.push('/users')}>
              Back to User List
            </Button>
          }
        />
      </Card>
    );
  }

  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Maker & Account Profile"
        subtitle={`Audit student registration, college verification, and security role for ID: ${id}`}
        breadcrumbs={[{ label: 'Administration', href: '/users' }, { label: 'User Profile' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push('/users')}
            icon={ArrowLeft}
          >
            Back to Users
          </Button>
        }
      />

      <Card className="p-6 sm:p-8 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-brand-primary dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-3xl font-extrabold shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {user.name || 'Unnamed Maker'}
              </h2>
              <Badge
                variant={
                  user.role === 'admin'
                    ? 'danger'
                    : user.role === 'seller'
                    ? 'warning'
                    : 'primary'
                }
                size="sm"
              >
                {user.role || 'customer'}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> {user.email}
            </p>
          </div>
        </div>

        {/* Academic & Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-brand-primary dark:text-blue-400" /> Affiliated Institution
            </span>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {user.college || 'Engineering College'}
            </div>
            {user.branch && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Branch: {user.branch}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" /> Account Created
            </span>
            <div className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              User ID: {user._id}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
