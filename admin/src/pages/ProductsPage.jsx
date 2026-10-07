import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
} from 'lucide-react';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in-stock', 'low-stock', 'out-of-stock'
  const [currentPage, setCurrentPage] = useState(1);

  // Deletion Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null, deleting: false });

  // Quick Stock Adjustment State
  const [adjustingStockId, setAdjustingStockId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[Fetch Products Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const confirmDelete = (product) => {
    setDeleteModal({ open: true, product, deleting: false });
  };

  const executeDelete = async () => {
    if (!deleteModal.product?._id) return;
    setDeleteModal((prev) => ({ ...prev, deleting: true }));
    try {
      await api.delete(`/products/${deleteModal.product._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteModal.product._id));
      setDeleteModal({ open: false, product: null, deleting: false });
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete product.');
      setDeleteModal({ open: false, product: null, deleting: false });
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Component Catalog & Stock</h1>
          <p className="text-sm text-slate-400">Manage hardware inventory, datasheets, pricing, and stock levels</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/products/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 text-sm transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Hardware Item
          </button>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, category, or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
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
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Stock Filter Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => {
                setStockFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                stockFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => {
                setStockFilter('low-stock');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                stockFilter === 'low-stock' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => {
                setStockFilter('out-of-stock');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                stockFilter === 'out-of-stock' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                <th className="p-4">Item Details</th>
                <th className="p-4">Category / SKU</th>
                <th className="p-4">Price / Discount</th>
                <th className="p-4">Stock Control</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                // Skeletons
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-800"></div>
                        <div className="space-y-1.5">
                          <div className="w-36 h-4 bg-slate-800 rounded"></div>
                          <div className="w-20 h-3 bg-slate-800 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-800 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                        <Package className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-white">No products found</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Try modifying search keywords or clearing active filters.
                      </p>
                    </div>
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
                    <tr key={product._id} className="hover:bg-slate-900/50 transition-all">
                      {/* Item Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.images?.[0] ||
                              'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={product.title}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="font-semibold text-white truncate">{product.title}</div>
                            <span className="text-xs text-slate-400 truncate block">
                              {product.description?.substring(0, 50) || 'Official TechCrate component'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                          {product.category || 'General'}
                        </span>
                        <div className="text-[11px] font-mono text-slate-500 mt-1">
                          SKU: {product.sku || product._id?.slice(-6).toUpperCase() || 'N/A'}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        <div className="font-bold text-emerald-400">₹{Number(product.price).toLocaleString('en-IN')}</div>
                        {discount > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-slate-500 line-through">₹{product.originalPrice}</span>
                            <span className="text-amber-400 font-semibold">{discount}% off</span>
                          </div>
                        )}
                      </td>

                      {/* Stock Adjustment Controls */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={adjustingStockId === product._id || isOut}
                            onClick={() => handleStockUpdate(product._id, stock, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 flex items-center justify-center font-bold text-xs disabled:opacity-30"
                            title="Decrease Stock"
                          >
                            -
                          </button>
                          <span className="font-mono text-sm font-semibold text-white min-w-[28px] text-center">
                            {stock}
                          </span>
                          <button
                            disabled={adjustingStockId === product._id}
                            onClick={() => handleStockUpdate(product._id, stock, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 flex items-center justify-center font-bold text-xs disabled:opacity-30"
                            title="Increase Stock"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="p-4">
                        {isOut ? (
                          <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                            <XCircle className="w-4 h-4" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                            <AlertTriangle className="w-4 h-4" /> Low Stock ({stock})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <CheckCircle className="w-4 h-4" /> In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/products/${product._id}/edit`)}
                            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-all"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(product)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                            title="Delete Product"
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
          <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
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

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Hardware Product?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to permanently remove{' '}
              <span className="font-semibold text-white">"{deleteModal.product?.title}"</span> from the catalog?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={deleteModal.deleting}
                onClick={() => setDeleteModal({ open: false, product: null, deleting: false })}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={deleteModal.deleting}
                onClick={executeDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20"
              >
                {deleteModal.deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
