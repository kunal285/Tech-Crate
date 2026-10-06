import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { productService } from '../../services/productService';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Microcontrollers',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80',
    operatingVoltage: '5V DC',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productService.createProduct({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: [formData.imageUrl],
        specifications: { operatingVoltage: formData.operatingVoltage },
      });
      navigate('/products');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create Hardware Component</h1>
        <p className="text-sm text-slate-400">Add new component or breakout board to ProjectKart catalog</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Title</label>
          <input
            type="text"
            required
            placeholder="Arduino UNO R3 Board"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Price (₹)</label>
            <input
              type="number"
              required
              placeholder="449"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Stock</label>
            <input
              type="number"
              required
              placeholder="25"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
          >
            <option value="Microcontrollers">Microcontrollers</option>
            <option value="Sensors">Sensors</option>
            <option value="Motors & Drivers">Motors & Drivers</option>
            <option value="Wireless & IoT">Wireless & IoT</option>
            <option value="Displays">Displays</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> Save Component Listing
        </button>
      </form>
    </div>
  );
}
