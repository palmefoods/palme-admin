import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Trash2, Plus, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', discountPercentage: '', maxUses: 100 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/coupons`);
      setCoupons(res.data);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountPercentage) return toast.error("Code and % required");
    
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/api/coupons`, form);
      setCoupons([res.data, ...coupons]);
      setForm({ code: '', discountPercentage: '', maxUses: 100 });
      toast.success("Coupon Created!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`${API_URL}/api/coupons/${id}`);
      setCoupons(coupons.filter(c => c._id !== id));
      toast.success("Coupon Deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Coupon Manager</h1>
           <p className="text-gray-500 text-sm">Create and track discount codes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
           <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Plus size={18} /> Create New Coupon
           </h3>
           <form onSubmit={handleCreate} className="space-y-4">
              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Coupon Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SUMMER10" 
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase font-bold tracking-wider focus:outline-none focus:border-palmeGreen"
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Discount (%)</label>
                    <input 
                        type="number" 
                        placeholder="10" 
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-palmeGreen"
                        value={form.discountPercentage}
                        onChange={e => setForm({...form, discountPercentage: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Max Uses</label>
                    <input 
                        type="number" 
                        placeholder="100" 
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-palmeGreen"
                        value={form.maxUses}
                        onChange={e => setForm({...form, maxUses: e.target.value})}
                    />
                  </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full bg-palmeGreen text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
              >
                 {isSubmitting ? "Creating..." : "Create Coupon"}
              </button>
           </form>
        </div>

        
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
                <p className="text-gray-400">Loading coupons...</p>
            ) : coupons.length === 0 ? (
                <div className="col-span-full text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Tag className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-400">No coupons active yet.</p>
                </div>
            ) : (
                coupons.map(coupon => (
                    <div key={coupon._id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between group relative overflow-hidden">
                        
                        <div className="absolute -right-6 -top-6 w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-green-100 dark:bg-green-900 text-palmeGreen font-bold px-3 py-1 rounded text-sm tracking-wide">
                                    {coupon.code}
                                </span>
                                <button onClick={() => handleDelete(coupon._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                {coupon.discountPercentage}% <span className="text-sm font-normal text-gray-500">OFF</span>
                            </h3>
                            
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-4 mb-2 overflow-hidden">
                                <div 
                                    className="bg-palmeGreen h-full rounded-full" 
                                    style={{ width: `${(coupon.usedCount / coupon.maxUses) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Used: {coupon.usedCount}</span>
                                <span>Limit: {coupon.maxUses}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => copyToClipboard(coupon.code)}
                            className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-palmeGreen transition-colors py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <Copy size={14} /> Copy Code
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Coupons;