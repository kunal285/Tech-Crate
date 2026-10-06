import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, GraduationCap, ShoppingBag, Heart } from 'lucide-react';
import { userService } from '../../services/userService';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const data = await userService.getUserById(id);
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.name || 'Rahul Sharma'}</h1>
            <p className="text-sm text-slate-400">{user?.email || 'student@projectkart.com'}</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Role: {user?.role || 'customer'}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 space-y-2 text-sm text-slate-300">
          <p><GraduationCap className="w-4 h-4 inline text-cyan-400 mr-2" /> College: {user?.college || 'BITS Pilani'}</p>
          <p><ShoppingBag className="w-4 h-4 inline text-emerald-400 mr-2" /> Total Orders Placed: 12</p>
          <p><Heart className="w-4 h-4 inline text-rose-400 mr-2" /> Wishlist Items Saved: 5</p>
        </div>
      </div>
    </div>
  );
}
