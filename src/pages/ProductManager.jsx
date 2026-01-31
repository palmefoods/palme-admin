import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon, TrendingUp, Package, AlertCircle, Tag, Save, Layers, LayoutGrid, List } from 'lucide-react'; 
import ImageUpload from '../components/ImageUpload'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductManager = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  
  const [viewMode, setViewMode] = useState('list'); 
  const [searchTerm, setSearchTerm] = useState('');

  
  const stats = {
    total: products.length,
    lowStock: products.filter(p => (p.stock || 0) < 10).length, 
    totalValue: products.reduce((acc, curr) => acc + (curr.price * (curr.stock || 0)), 0) 
  };
  
  const [formData, setFormData] = useState({
    name: '', size: '500ml', price: '', discountPrice: '', discountCode: '', weightKg: '', description: '', image: '', stock: ''
  });

  useEffect(() => {
    fetchProducts();
    
    
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
        setSearchTerm(searchParam);
    }
  }, [location.search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      size: product.size,
      price: product.price,
      discountPrice: product.discountPrice || '', 
      discountCode: product.discountCode || '', 
      weightKg: product.weightKg || '',
      description: product.description,
      image: product.image || '',
      stock: product.stock || 0 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/api/products/${editingProduct._id}`, formData);
      } else {
        await axios.post(`${API_URL}/api/products`, formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      
      setFormData({ name: '', size: '500ml', price: '', discountPrice: '', discountCode: '', weightKg: '', description: '', image: '', stock: '' });
      fetchProducts();
    } catch (err) {
      alert("Operation failed");
    }
  };

  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.discountCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
           <div>
             <p className="text-gray-400 text-xs font-bold uppercase">Total Products</p>
             <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{stats.total}</h3>
           </div>
           <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-palmeGreen dark:text-green-400"><Package /></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
           <div>
             <p className="text-gray-400 text-xs font-bold uppercase">Inventory Value</p>
             <h3 className="text-3xl font-bold text-gray-800 dark:text-white">₦{stats.totalValue.toLocaleString()}</h3>
           </div>
           <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400"><TrendingUp /></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
           <div>
             <p className="text-gray-400 text-xs font-bold uppercase">Low Stock Alerts</p>
             <h3 className={`text-3xl font-bold ${stats.lowStock > 0 ? 'text-red-600' : 'text-gray-800'} dark:text-red-400`}>{stats.lowStock}</h3>
           </div>
           <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 dark:text-red-400"><AlertCircle /></div>
        </div>
      </div>

      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            className="w-full pl-10 p-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-palmeGreen dark:placeholder-gray-400 transition-colors" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
            
            <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-1">
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-palmeGreen' : 'text-gray-400'}`}
                >
                    <List size={20} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-palmeGreen' : 'text-gray-400'}`}
                >
                    <LayoutGrid size={20} />
                </button>
            </div>

            <button 
            onClick={() => { setEditingProduct(null); setFormData({ name: '', size: '500ml', price: '', discountPrice: '', discountCode: '', weightKg: '', description: '', image: '', stock: '' }); setShowModal(true); }}
            className="bg-palmeGreen text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-800 transition-colors flex-1 md:flex-initial justify-center"
            >
            <Plus size={20} /> Add Product
            </button>
        </div>
      </div>

      
      
      {loading ? (
           <div className="p-12 text-center text-gray-400 animate-pulse">Loading Inventory...</div>
      ) : filteredProducts.length === 0 ? (
           <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
               <p className="text-gray-400 font-bold">No products found matching "{searchTerm}"</p>
           </div>
      ) : (
          <>
            
            {viewMode === 'list' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-600">
                            <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Product</th>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Stock</th> 
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Promo Code</th> 
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Size</th>
                            <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredProducts.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600">
                                    {p.image ? (
                                    p.image.endsWith('.mp4') ? <video src={p.image} className="w-full h-full object-cover" /> : <img src={p.image} className="w-full h-full object-cover"/>
                                    ) : (
                                    <ImageIcon size={20} className="text-gray-400"/>
                                    )}
                                </div>
                                <span className="font-bold text-gray-800 dark:text-white">{p.name}</span>
                                </td>
                                
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        (p.stock || 0) < 10 
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                        : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    }`}>
                                        {p.stock || 0} Units
                                    </span>
                                </td>

                                <td className="p-4">
                                {p.discountPrice ? (
                                    <div>
                                    <span className="text-palmeRed font-bold">₦{Number(p.discountPrice).toLocaleString()}</span>
                                    <span className="text-gray-400 text-xs line-through block">₦{Number(p.price).toLocaleString()}</span>
                                    </div>
                                ) : (
                                    <span className="font-bold text-gray-800 dark:text-white">₦{Number(p.price).toLocaleString()}</span>
                                )}
                                </td>
                                
                                <td className="p-4">
                                {p.discountCode ? (
                                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 w-fit">
                                        <Tag size={12} /> {p.discountCode}
                                    </span>
                                ) : (
                                    <span className="text-gray-300 dark:text-gray-600 text-xs">-</span>
                                )}
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">{p.size}</td>
                                <td className="p-4 text-right space-x-2">
                                <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit size={18}/></button>
                                <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            )}

            
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((p) => (
                        <div key={p._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
                                {p.image ? (
                                    p.image.endsWith('.mp4') ? <video src={p.image} className="w-full h-full object-cover" /> : <img src={p.image} className="w-full h-full object-cover"/>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={40}/></div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(p)} className="bg-white text-blue-500 p-2 rounded-lg shadow-sm hover:bg-blue-50"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(p._id)} className="bg-white text-red-500 p-2 rounded-lg shadow-sm hover:bg-red-50"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800 dark:text-white truncate pr-2">{p.name}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        (p.stock || 0) < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        {p.stock} left
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{p.size}</p>
                                        <p className="font-bold text-lg text-palmeGreen mt-1">₦{Number(p.price).toLocaleString()}</p>
                                    </div>
                                    {p.discountCode && (
                                        <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-1 rounded font-bold">{p.discountCode}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </>
      )}

      
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
              <button onClick={() => setShowModal(false)}><X className="text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              <div className="col-span-2">
                <ImageUpload 
                    label="Product Image (or Video)"
                    initialImage={formData.image} 
                    onUploadComplete={(url) => setFormData({ ...formData, image: url })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Product Name</label>
                   <input className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Size</label>
                   <select className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" name="size" value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})}>
                     {['250ml', '500ml', '1 Litre', '2 Litres', '5 Litres', '10 Litres', '25 Litres (Keg)'].map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1">
                        <Layers size={14}/> Stock Quantity
                    </label>
                    <input 
                        type="number" 
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        name="stock" 
                        value={formData.stock} 
                        onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                        required 
                        placeholder="e.g. 50"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Weight (Kg) - For Shipping</label>
                    <input 
                        type="number" 
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        name="weightKg" 
                        value={formData.weightKg} 
                        onChange={(e) => setFormData({...formData, weightKg: e.target.value})} 
                        placeholder="e.g. 1.5"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-6"> 
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Regular Price (₦)</label>
                   <input type="number" className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" name="price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div>
                   <label className="block text-xs font-bold text-palmeRed uppercase mb-1">Discount Price</label>
                   <input type="number" className="w-full p-3 border border-palmeRed/30 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50 dark:text-white rounded-lg" name="discountPrice" value={formData.discountPrice} onChange={(e) => setFormData({...formData, discountPrice: e.target.value})} placeholder="Optional" />
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-1">Promo Code</label>
                   <div className="relative">
                        <Tag className="absolute left-3 top-3.5 text-purple-300" size={16} />
                        <input 
                            type="text" 
                            className="w-full pl-9 p-3 border border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-white rounded-lg focus:ring-purple-200 focus:border-purple-400" 
                            name="discountCode" 
                            value={formData.discountCode} 
                            onChange={(e) => setFormData({...formData, discountCode: e.target.value})} 
                            placeholder="e.g. VIP20" 
                        />
                   </div>
                </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</label>
                  <textarea className="w-full p-3 border rounded-lg h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white" name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <button className="w-full bg-palmeGreen hover:bg-green-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                <Save size={20} /> {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;