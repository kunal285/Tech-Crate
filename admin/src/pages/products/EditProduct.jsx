import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { productService } from '../../services/productService';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', price: '', category: 'Microcontrollers', description: '' });

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productService.getProductById(id);
      if (data) {
        setFormData({
          title: data.title || '',
          price: data.price || '',
          category: data.category || 'Microcontrollers',
          description: data.description || '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await productService.updateProduct(id, formData);
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Edit Component Details</h1>
      </div>

      <form onSubmit={handleSave} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Price (₹)</label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Update Product
        </button>
      </form>
    </div>
  );
}
