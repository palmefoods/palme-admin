import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Globe, Moon, UserPlus, Trash2, Video, Tag, Truck, FileText, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('System');
  
  
  const [settings, setSettings] = useState({ 
    maintenance_mode: false,
    youtube_link: '',
    hero_badge_price: '',
    hero_badge_text: 'New Harvest',
    doorstep_price: 10000,
    park_price: 5000,
    delivery_note: 'Shipping fees are calculated based on weight.'
  });
  
  const [admins, setAdmins] = useState([]);
  const { isDark, toggleTheme } = useTheme();
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', role: 'Editor' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchAdmins();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/settings`);
      
      if (res.data) {
        
        
        const mergedSettings = Array.isArray(res.data) 
            ? res.data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
            : res.data;
            
        setSettings(prev => ({ ...prev, ...mergedSettings }));
      }
    } catch (err) { console.error("Settings error", err); }
  };

  const fetchAdmins = async () => {
    try { const res = await axios.get(`${API_URL}/api/admins`); setAdmins(res.data); } catch (err) {}
  };

  
  const handleSaveSetting = async (key, value) => {
    setLoading(true);
    try {
        await axios.post(`${API_URL}/api/settings`, { key, value });
        setSettings(prev => ({ ...prev, [key]: value }));
        
    } catch (err) {
        alert("Failed to save setting");
    } finally {
        setLoading(false);
    }
  };

  
  const saveAllTabSettings = async (keysToSave) => {
    setLoading(true);
    try {
        await Promise.all(keysToSave.map(key => 
            axios.post(`${API_URL}/api/settings`, { key, value: settings[key] })
        ));
        alert("Settings Saved Successfully!");
    } catch (err) {
        alert("Error saving settings");
    } finally {
        setLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    const newValue = !settings.maintenance_mode;
    handleSaveSetting('maintenance_mode', newValue);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/admins`, newAdmin);
      setAdmins([...admins, res.data]);
      setNewAdmin({ email: '', password: '', role: 'Editor' });
      alert("Admin Added");
    } catch (err) { alert("Failed"); }
  };

  const handleDeleteAdmin = async (id) => {
    if(!window.confirm("Remove this admin?")) return;
    try {
        await axios.delete(`${API_URL}/api/admins/${id}`);
        setAdmins(admins.filter(a => a._id !== id));
    } catch (err) { alert("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Settings</h2>
           <p className="text-gray-400 dark:text-gray-500">Manage Content, Delivery & System</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
           {['System', 'Content', 'Delivery', 'Security'].map(tab => (
             <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                    activeTab === tab 
                    ? 'bg-white dark:bg-gray-600 text-palmeGreen dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                {tab}
            </button>
           ))}
        </div>
      </div>

      
      {activeTab === 'System' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-8 transition-colors">
           <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-8">
              <div className="flex items-center gap-4">
                 <div className={`p-4 rounded-full ${settings.maintenance_mode ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                    <Globe size={32} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Maintenance Mode</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Close the customer site temporarily.</p>
                 </div>
              </div>
              <button 
                onClick={toggleMaintenance} 
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                 <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${settings.maintenance_mode ? 'translate-x-8' : ''}`}></div>
              </button>
           </div>

           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <Moon size={32} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Switch admin dashboard appearance.</p>
                 </div>
              </div>
              <button 
                onClick={toggleTheme} 
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isDark ? 'bg-palmeGreen' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                 <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${isDark ? 'translate-x-8' : ''}`}></div>
              </button>
           </div>
           <div className="pt-8 border-t border-gray-100 dark:border-gray-700 mt-8">
                <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                    ⚠️ Danger Zone
                </h3>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-red-800 dark:text-red-400">Reset Database</h4>
                        <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-1">
                            This will delete <strong>ALL Orders</strong> and <strong>Customer Accounts</strong>. 
                            <br/>Products, Admins, and Settings will be safe.
                        </p>
                    </div>
                    <button 
                        onClick={async () => {
                            if (window.confirm("ARE YOU SURE? This cannot be undone.")) {
                                const doubleCheck = window.prompt("Type 'DELETE' to confirm.");
                                if (doubleCheck === 'DELETE') {
                                    try {
                                        await axios.delete(`${API_URL}/api/nuke-db`);
                                        alert("Database Reset Complete. Clean slate!");
                                        window.location.reload();
                                    } catch(err) {
                                        alert("Failed to reset DB.");
                                    }
                                }
                            }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-600/20 transition-all whitespace-nowrap"
                    >
                        Reset Data
                    </button>
                </div>
            </div>
        </div>
        
      )}

      
      {activeTab === 'Content' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-8 transition-colors">
            
            
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Video className="text-palmeGreen" size={20} />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Homepage Video</h3>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={settings.youtube_link || ''}
                        onChange={(e) => setSettings({...settings, youtube_link: e.target.value})}
                        placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                        className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-palmeGreen outline-none"
                    />
                </div>
                <p className="text-xs text-gray-400">Use the "Embed" link from YouTube (e.g. /embed/ID), not the watch link.</p>
            </div>

            
            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                    <Tag className="text-palmeGreen" size={20} />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Hero Badge Config</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Badge Text</label>
                        <input 
                            type="text" 
                            value={settings.hero_badge_text || ''}
                            onChange={(e) => setSettings({...settings, hero_badge_text: e.target.value})}
                            placeholder="e.g. New Harvest"
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-palmeGreen outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Price Display</label>
                        <input 
                            type="text" 
                            value={settings.hero_badge_price || ''}
                            onChange={(e) => setSettings({...settings, hero_badge_price: e.target.value})}
                            placeholder="e.g. ₦2,500"
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-palmeGreen outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button 
                    onClick={() => saveAllTabSettings(['youtube_link', 'hero_badge_text', 'hero_badge_price'])}
                    className="flex items-center gap-2 bg-palmeGreen hover:bg-green-800 text-white font-bold py-3 px-8 rounded-xl transition-all"
                    disabled={loading}
                >
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Content Settings'}
                </button>
            </div>
        </div>
      )}

      
      
{activeTab === 'Delivery' && (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-8 transition-colors">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div>
              <div className="flex items-center gap-2 mb-4">
                  <Truck className="text-palmeGreen" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Doorstep Base Rate</h3>
              </div>
              <input 
                  type="number" 
                  value={settings.doorstep_price || 0}
                  onChange={(e) => setSettings({...settings, doorstep_price: e.target.value})}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-palmeGreen outline-none"
              />
          </div>

          
          <div>
              <div className="flex items-center gap-2 mb-4">
                  <Truck className="text-palmeGreen" size={20} />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Park Pickup Rate</h3>
              </div>
              <input 
                  type="number" 
                  value={settings.park_price || 0}
                  onChange={(e) => setSettings({...settings, park_price: e.target.value})}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-palmeGreen outline-none"
              />
          </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100 dark:border-gray-700">
          
          
          <div>
              <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-palmeGreen" size={18} />
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">Doorstep Instruction</h3>
              </div>
              <textarea 
                  rows="3"
                  value={settings.doorstep_note || ''}
                  onChange={(e) => setSettings({...settings, doorstep_note: e.target.value})}
                  placeholder="e.g. Shipping fees are calculated based on weight..."
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-palmeGreen outline-none resize-none text-sm"
              ></textarea>
          </div>

          
          <div>
              <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-palmeGreen" size={18} />
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">Park Pickup Instruction</h3>
              </div>
              <textarea 
                  rows="3"
                  value={settings.park_note || ''}
                  onChange={(e) => setSettings({...settings, park_note: e.target.value})}
                  placeholder="e.g. Please bring your ID card to the park driver..."
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-palmeGreen outline-none resize-none text-sm"
              ></textarea>
          </div>
      </div>

      <div className="pt-4 flex justify-end">
          <button 
              onClick={() => saveAllTabSettings(['doorstep_price', 'park_price', 'doorstep_note', 'park_note'])}
              className="flex items-center gap-2 bg-palmeGreen hover:bg-green-800 text-white font-bold py-3 px-8 rounded-xl transition-all"
              disabled={loading}
          >
              <Save size={18} /> {loading ? 'Saving...' : 'Save Delivery Settings'}
          </button>
      </div>
  </div>
)}

      
      {activeTab === 'Security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <UserPlus size={20}/> Add Admin
              </h3>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                 <input 
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-palmeGreen" 
                    required 
                    placeholder="Email" 
                    value={newAdmin.email} 
                    onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                 />
                 <input 
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-palmeGreen" 
                    required 
                    placeholder="Password" 
                    value={newAdmin.password} 
                    onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
                 />
                 <button className="w-full bg-palmeGreen text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors">
                    Add Admin
                 </button>
              </form>
           </div>
           
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Shield size={20}/> Current Admins
              </h3>
              <div className="space-y-2">
                {admins.map(a => (
                    <div key={a._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-100 dark:border-gray-600 group">
                        <span className="text-gray-700 dark:text-gray-200">{a.email}</span>
                        <button onClick={() => handleDeleteAdmin(a._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;