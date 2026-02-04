import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Navigation, Plus, Trash2, Save, X, Search, Edit, AlertCircle } from 'lucide-react'; 
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LocationManager = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  
  const [editingLocation, setEditingLocation] = useState(null);

  const [formData, setFormData] = useState({
    state: '', 
    parkName: '', 
    address: '', 
    adminNote: '',
    basePrice: '' 
  });

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/locations`);
      if (Array.isArray(res.data)) {
          setLocations(res.data);
      }
    } catch (err) {
      console.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this park station? This will remove it from the checkout options.")) return;
    try {
       await axios.delete(`${API_URL}/api/locations/${id}`); 
       setLocations(prev => prev.filter(l => l._id !== id));
       toast.success("Station Deleted");
    } catch (err) { toast.error("Failed to delete"); }
  };

  
  const handleEdit = (loc) => {
    setEditingLocation(loc);
    setFormData({
        state: loc.state || '',
        parkName: loc.name, 
        address: loc.address || '',
        adminNote: loc.adminNote || '',
        basePrice: loc.basePrice || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        name: formData.parkName, 
        type: 'park', 
        basePrice: Number(formData.basePrice) || 0
      };

      if (editingLocation) {
        
        const res = await axios.put(`${API_URL}/api/locations/${editingLocation._id}`, payload);
        setLocations(locations.map(l => l._id === editingLocation._id ? res.data : l));
        toast.success("Station Updated!");
      } else {
        
        const res = await axios.post(`${API_URL}/api/locations`, payload);
        setLocations([...locations, res.data]);
        toast.success("Station Added!");
      }

      setShowModal(false);
      setEditingLocation(null);
      setFormData({ state: '', parkName: '', address: '', adminNote: '', basePrice: '' });
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to save location.");
    }
  };

  const filteredLocations = locations.filter(l => 
    (l.name || l.parkName)?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <div>
           <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <MapPin className="text-palmeGreen" /> Park Stations
           </h2>
           <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Manage pickup locations available at checkout.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search state or park..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-palmeGreen outline-none dark:text-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <button 
                onClick={() => { 
                    setEditingLocation(null); 
                    setFormData({ state: '', parkName: '', address: '', adminNote: '', basePrice: '' }); 
                    setShowModal(true); 
                }} 
                className="bg-palmeGreen text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-800 transition-colors shadow-lg shadow-green-100 dark:shadow-none whitespace-nowrap"
            >
              <Plus size={20} /> Add Station
           </button>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-gray-400 col-span-full text-center py-10">Loading stations...</p>
        ) : filteredLocations.length === 0 ? (
           <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
             <Navigation className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
             <p className="text-gray-400 dark:text-gray-500 font-bold">No stations found.</p>
             <p className="text-xs text-gray-400 mt-1">Add a new station to see it here.</p>
           </div>
        ) : (
           filteredLocations.map((loc) => (
             <div key={loc._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group relative">
                
                <div className="flex justify-between items-start mb-4">
                   <span className="px-3 py-1 bg-palmeGreen/10 text-palmeGreen text-xs font-bold uppercase tracking-wider rounded-full">
                     {loc.state || 'Unknown State'}
                   </span>
                   <div className="flex gap-2">
                       
                       <button onClick={() => handleEdit(loc)} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 transition-colors">
                          <Edit size={18} />
                       </button>
                       <button onClick={() => handleDelete(loc._id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                          <Trash2 size={18} />
                       </button>
                   </div>
                </div>
                
                <div className="space-y-3">
                   <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">{loc.name || loc.parkName}</h3>
                   
                   <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{loc.address}</p>
                   </div>

                   
                   <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Shipping Fee:</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                            {loc.basePrice ? `₦${Number(loc.basePrice).toLocaleString()}` : 'Free'}
                        </span>
                   </div>

                   {loc.adminNote && (
                     <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Admin Note:</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                          {loc.adminNote}
                        </p>
                     </div>
                   )}
                </div>
             </div>
           ))
        )}
      </div>

      
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up p-8 transition-colors max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{editingLocation ? 'Edit Station' : 'Add New Station'}</h3>
                <button onClick={() => setShowModal(false)}><X className="text-gray-400 hover:text-red-500" /></button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">State</label>
                   <select 
                      className="w-full p-3 border rounded-lg focus:border-palmeGreen outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                   >
                      <option value="">Select State...</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                   </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Station Name</label>
                  <input 
                    className="w-full p-3 border rounded-lg focus:border-palmeGreen outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    required 
                    placeholder="e.g. Jabi Park, Utako"
                    value={formData.parkName}
                    onChange={(e) => setFormData({...formData, parkName: e.target.value})}
                  />
                </div>
                
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Shipping Price (₦)</label>
                  <input 
                    type="number"
                    className="w-full p-3 border rounded-lg focus:border-palmeGreen outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    required 
                    placeholder="e.g. 2500"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">This amount will be added to the customer's total at checkout.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Full Address / Description</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg focus:border-palmeGreen outline-none h-20 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    required 
                    placeholder="Describe how the customer finds this park..."
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Internal Note (Hidden)</label>
                  <input 
                    className="w-full p-3 border rounded-lg focus:border-palmeGreen outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    placeholder="e.g. Driver Number: 080..." 
                    value={formData.adminNote}
                    onChange={(e) => setFormData({...formData, adminNote: e.target.value})}
                  />
                </div>

                <button className="w-full bg-palmeGreen text-white font-bold py-4 rounded-xl hover:bg-green-800 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-green-900/20">
                   <Save size={20} /> {editingLocation ? 'Update Station' : 'Save Station'}
                </button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LocationManager;