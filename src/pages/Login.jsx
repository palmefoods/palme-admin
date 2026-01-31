import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Loader } from 'lucide-react';
import axios from 'axios'; 
import logo from '../assets/logo-green.png'; 


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => { 
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      
      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      
      
      localStorage.setItem('palme_admin_token', JSON.stringify(data));
      
      
      navigate('/');
      
    } catch (err) {
      
      console.error("Login Error:", err);
      const serverMessage = err.response?.data?.message || 'Connection failed. Is backend running?';
      setError(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] flex items-center justify-center p-4">
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-500 hover:shadow-green-900/20 animate-fade-in-up">
        
        <div className="bg-palmeGreen/5 p-8 text-center border-b border-green-50">
           {/* Note: I kept your double png extension if that's how your file is named, but check it! */}
           <img src={logo} alt="PalmeFoods" className="h-16 mx-auto mb-4 object-contain animate-bounce-slow" />
           <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
           <p className="text-gray-500 text-sm">Please sign in to manage your store.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-palmeGreen focus:ring-2 focus:ring-green-100 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                  placeholder="admin@palmefoods.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-palmeGreen focus:ring-2 focus:ring-green-100 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg flex items-center gap-2 animate-shake">
                <span>⚠️</span> {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                isLoading ? 'bg-green-800 cursor-not-allowed' : 'bg-palmeGreen hover:bg-green-800 hover:shadow-green-900/20'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} /> Verifying...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 font-mono border-t border-gray-100">
          PALME ADMIN PORTAL • v2.0
        </div>
      </div>
    </div>
  );
};

export default Login;