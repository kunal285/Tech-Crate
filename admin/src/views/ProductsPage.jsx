'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  RotateCcw,
  Archive,
  Boxes,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import { Card, StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in-stock', 'low-stock', 'out-of-stock'
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' (default catalog), 'all', 'archived'
  const [currentPage, setCurrentPage] = useState(1);

  // Deletion Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null, deleting: false, mode: 'archive' });

  // Quick Stock Adjustment State
  const [adjustingStockId, setAdjustingStockId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?includeArchived=true');
      setProducts(Array.isArray(res.data) ? res.data : (res.data?.products || []));
    } catch (err) {
      console.error('[Fetch Products Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => !p.isArchived).length;
    const lowStock = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
    const outOfStock = products.filter((p) => (p.stock || 0) <= 0).length;
    return { total, active, lowStock, outOfStock };
  }, [products]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'in-stock') matchesStock = (p.stock || 0) > 10;
      else if (stockFilter === 'low-stock') matchesStock = (p.stock || 0) > 0 && (p.stock || 0) <= 10;
      else if (stockFilter === 'out-of-stock') matchesStock = (p.stock || 0) === 0;

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = !p.isArchived;
      else if (statusFilter === 'archived') matchesStatus = Boolean(p.isArchived);

      return matchesSearch && matchesCategory && matchesStock && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, stockFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const confirmDelete = (product) => {
    setDeleteModal({ open: true, product, deleting: false, mode: 'archive' });
  };

  const executeDelete = async (isPermanent = false) => {
    if (!deleteModal.product?._id) return;
    setDeleteModal((prev) => ({ ...prev, deleting: true }));
    try {
      const url = isPermanent
        ? `/products/${deleteModal.product._id}?permanent=true`
        : `/products/${deleteModal.product._id}`;
      const res = await api.delete(url);

      if (isPermanent && res.data?.deleted) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteModal.product._id));
      } else {
        // Soft-archived
        setProducts((prev) =>
          prev.map((p) =>
            p._id === deleteModal.product._id
              ? { ...p, isArchived: true, status: 'archived' }
              : p
          )
        );
      }
      setDeleteModal({ open: false, product: null, deleting: false, mode: 'archive' });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete product.');
      setDeleteModal({ open: false, product: null, deleting: false, mode: 'archive' });
    }
  };

  const handleRestore = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isArchived: false, status: 'active' });
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, isArchived: false, status: 'active' } : p
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore product.');
    }
  };

  const handleStockUpdate = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, (currentStock || 0) + delta);
    setAdjustingStockId(productId);
    try {
      await api.put(`/products/${productId}`, { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, stock: newStock } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update inventory.');
    } finally {
      setAdjustingStockId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Hardware Catalog & Inventory"
        subtitle="Manage components, board variants, live warehouse stock levels, and datasheets"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Products' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={fetchProducts}
              loading={loading}
              icon={RefreshCw}
              title="Refresh Catalog"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/products/create')}
              icon={Plus}
            >
              Add Hardware Item
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={metrics.total}
          icon={Boxes}
          accentColor="blue"
          description="In inventory database"
        />
        <StatCard
          title="Active in Store"
          value={metrics.active}
          icon={Layers}
          accentColor="cyan"
          description="Visible to customers"
        />
        <StatCard
          title="Low Stock Warning"
          value={metrics.lowStock}
          icon={AlertTriangle}
          accentColor="orange"
          trend={metrics.lowStock > 0 ? 'down' : 'neutral'}
          description="Stock ≤ 10 units"
        />
        <StatCard
          title="Out of Stock"
          value={metrics.outOfStock}
          icon={XCircle}
          accentColor="purple"
          trend={metrics.outOfStock > 0 ? 'down' : 'neutral'}
          description="Depleted items"
        />
      </div>

      {/* Search & Filters */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, SKU, or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary cursor-pointer transition-all"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            {/* Status Filter Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('active');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === 'active'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('archived');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === 'archived'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Archived
              </button>
            </div>

            {/* Stock Filter Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStockFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  stockFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Stock
              </button>
              <button
                type="button"
                onClick={() => {
                  setStockFilter('low-stock');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  stockFilter === 'low-stock'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Low Stock
              </button>
              <button
                type="button"
                onClick={() => {
                  setStockFilter('out-of-stock');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  stockFilter === 'out-of-stock'
                    ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Depleted
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Products Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">Category / SKU</th>
                <th className="py-3.5 px-4">Price / Discount</th>
                <th className="py-3.5 px-4">Warehouse Stock</th>
                <th className="py-3.5 px-4">Catalog Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                // Skeletons
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-1.5">
                          <div className="w-36 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <EmptyState
                      icon={Package}
                      title="No components found"
                      description="No hardware products match the selected filters or search keyword."
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('All');
                            setStockFilter('all');
                            setStatusFilter('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const stock = product.stock || 0;
                  const isOut = stock <= 0;
                  const isLow = stock > 0 && stock <= 10;
                  const discount =
                    product.originalPrice && product.originalPrice > product.price
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : 0;

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Item Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.images?.[0] ||
                              'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={product.title}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {product.title}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">
                              {product.description?.substring(0, 50) || 'Official TechCrate component'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td className="p-4">
                        <Badge variant="neutral" size="sm">
                          {product.category || 'General'}
                        </Badge>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                          SKU: {product.sku || product._id?.slice(-6).toUpperCase() || 'N/A'}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </div>
                        {discount > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                            <span className="text-slate-400 line-through tabular-nums">
                              ₹{product.originalPrice}
                            </span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              {discount}% off
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Stock Adjustment Controls */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={adjustingStockId === product._id || isOut}
                            onClick={() => handleStockUpdate(product._id, stock, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-xs disabled:opacity-30 transition-colors"
                            title="Decrease Stock"
                          >
                            -
                          </button>
                          <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 min-w-[32px] text-center tabular-nums">
                            {stock}
                          </span>
                          <button
                            type="button"
                            disabled={adjustingStockId === product._id}
                            onClick={() => handleStockUpdate(product._id, stock, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-xs disabled:opacity-30 transition-colors"
                            title="Increase Stock"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="p-4">
                        <div className="space-y-1.5">
                          <div>
                            {product.isArchived ? (
                              <Badge variant="warning" size="sm">
                                Archived
                              </Badge>
                            ) : (
                              <Badge variant="success" size="sm">
                                Active Catalog
                              </Badge>
                            )}
                          </div>
                          <div>
                            {isOut ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                                <XCircle className="w-3.5 h-3.5" /> Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5" /> Low ({stock})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> In Stock ({stock})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {product.isArchived && (
                            <button
                              type="button"
                              onClick={() => handleRestore(product)}
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 transition-colors"
                              title="Restore to Active Catalog"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => router.push(`/products/${product._id}/edit`)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(product)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 transition-colors"
                            title="Archive or Delete Product"
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
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
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

      {/* Delete / Archive Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null, deleting: false, mode: 'archive' })}
        title="Remove Hardware Component"
        description="Choose between safe catalog archival and permanent database purge."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Component: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              "{deleteModal.product?.title}"
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
              <strong className="text-amber-700 dark:text-amber-400 block mb-0.5">Safe Archival (Recommended):</strong>
              Removes the component from customer searches, product recommendations, and active storefront browsing while preserving existing order histories and invoices.
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
              <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">Permanent Purge:</strong>
              Completely deletes the database record. Only allowed if no customer orders reference this hardware item.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="md"
              disabled={deleteModal.deleting}
              onClick={() => setDeleteModal({ open: false, product: null, deleting: false, mode: 'archive' })}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="md"
              disabled={deleteModal.deleting}
              onClick={() => executeDelete(false)}
              icon={Archive}
              loading={deleteModal.deleting}
              className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800"
            >
              Archive Component
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={deleteModal.deleting}
              onClick={() => executeDelete(true)}
              icon={Trash2}
              loading={deleteModal.deleting}
            >
              Purge DB
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
