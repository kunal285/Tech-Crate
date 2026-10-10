'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Layers, CheckCircle, RefreshCw, FolderTree } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreating(true);
    try {
      await api.post('/admin/categories', { name: newCatName.trim() });
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Hardware Taxonomy & Categories"
        subtitle="Organize electronics components, development boards, and robotics kits into customer-browseable categories"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Categories' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={fetchCategories}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </Button>
        }
      />

      {/* Add Category Form Card */}
      <Card className="p-5 max-w-2xl">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
          Create New Category
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Passives & Resistors, IoT Boards..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            disabled={creating}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={creating}
            disabled={!newCatName.trim()}
            icon={Plus}
          >
            Add Category
          </Button>
        </form>
      </Card>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={FolderTree}
            title="No categories found"
            description="Get started by creating your first component category above."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat._id || cat.name}
              className="p-5 flex items-center justify-between hover:border-brand-primary/40 dark:hover:border-blue-500/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-brand-primary dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cat.count || 0} items listed
                  </p>
                </div>
              </div>
              <Badge variant="success" size="sm">
                Active
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
