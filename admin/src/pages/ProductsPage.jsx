import React, { useEffect, useState } from 'react';
import { Package, Plus, Trash2, Edit, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import adminApi from '../services/adminApi';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Microcontrollers',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80',
    operatingVoltage: '5V DC',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/products', {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || formData.price),
        stock: Number(formData.stock),
        images: [formData.imageUrl],
        specifications: { operatingVoltage: formData.operatingVoltage },
      });
      setShowAddModal(false);
      fetchProducts();
      setFormData({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        category: 'Microcontrollers',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80',
        operatingVoltage: '5V DC',
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating product');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this hardware product?')) {
      try {
        await adminApi.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Component Catalog & Stock</h1>
          <p className="text-sm text-slate-400">Manage electronics inventory, specs, prices, and datasheets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 text-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Hardware Item
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by title, microcontroller, sensor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">Item Details</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Rating</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {filteredProducts.map((product) => (
              <tr key={product._id} className="hover:bg-slate-900/50 transition-all">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
                    />
                    <div>
                      <div className="font-semibold text-white">{product.title}</div>
                      <span className="text-xs text-slate-400">{product.specifications?.operatingVoltage || '5V DC'}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {product.category}
                  </span>
                </td>
                <td className="p-4 font-bold text-emerald-400">₹{product.price}</td>
                <td className="p-4">
                  {product.stock > 10 ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle className="w-4 h-4" /> {product.stock} in stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                      <AlertTriangle className="w-4 h-4" /> Low Stock ({product.stock})
                    </span>
                  )}
                </td>
                <td className="p-4 text-slate-300">⭐ {product.rating || 4.8}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(product._id)}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white">Add Electronics Component</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                  placeholder="Arduino UNO R3 Board"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                >
                  <option value="Microcontrollers">Microcontrollers</option>
                  <option value="Sensors">Sensors</option>
                  <option value="Motors & Drivers">Motors & Drivers</option>
                  <option value="Wireless & IoT">Wireless & IoT</option>
                  <option value="Displays">Displays</option>
                  <option value="Power & Battery">Power & Battery</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
