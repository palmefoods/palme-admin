import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, ShoppingCart, Package, MapPin, Users, Settings, LogOut, Bell, Search, Megaphone, Menu, X, AlertCircle, Clock, Tag 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const notifRef = useRef(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('palme_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        setAdminName(user.name || 'Admin');
    }

    const fetchData = async () => {
        try {
            const [orderRes, productRes] = await Promise.all([
                axios.get(`${API_URL}/api/orders`),
                axios.get(`${API_URL}/api/products`)
            ]);

            const newNotifs = [];

           
            const pending = orderRes.data.filter(o => o.status === 'Pending');
            pending.forEach(o => {
                newNotifs.push({
                    id: o._id,
                    type: 'order',
                    message: `New Order from ${o.customer?.name || 'Guest'}`,
                    subtext: `₦${o.totalAmount.toLocaleString()} • ${new Date(o.createdAt).toLocaleDateString()}`,
                    link: `/orders?search=${o._id}`
                });
            });

           
            const lowStock = productRes.data.filter(p => (p.stock || 0) < 10);
            lowStock.forEach(p => {
                newNotifs.push({
                    id: p._id,
                    type: 'stock',
                    message: `Low Stock: ${p.name}`,
                    subtext: `Only ${p.stock} units remaining`,
                    link: `/products?search=${p.name}`
                });
            });

            setNotifications(newNotifs);
            setUnreadCount(newNotifs.length);

        } catch (err) { console.error("Notification Fetch Error", err); }
    };

    fetchData();

   
    const handleClickOutside = (event) => {
        if (notifRef.current && !notifRef.current.contains(event.target)) {
            setNotifOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('palme_admin_token');
    localStorage.removeItem('palme_user');
    navigate('/login');
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();
    
   
    const isOrder = 
        query.toUpperCase().includes('ORD') || 
        /\d/.test(query) ||
        (query.length > 20 && !query.includes(' '));

    if (isOrder) {
        navigate(`/orders?search=${query}`);
    } else {
        navigate(`/products?search=${query}`);
    }
    setSearchQuery('');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' }, 
    { icon: Package, label: 'Products', path: '/products' }, 
    { icon: Tag, label: 'Coupons', path: '/coupons' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: MapPin, label: 'Logistics', path: '/locations' },
    { icon: Megaphone, label: 'Site Content', path: '/site-content' }, 
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F3F5F7] dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200"> 
      
      
      <div className={`fixed inset-0 bg-black/50 z-20 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>

      
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
            <span className="bg-palmeGreen text-white rounded-xl w-8 h-8 flex items-center justify-center text-sm font-bold shadow-green-200">P</span>
            Palme<span className="text-palmeGreen">Admin</span>
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500"><X /></button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-palmeGreen text-white font-bold shadow-md shadow-green-100 dark:shadow-none' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm font-medium hover:bg-red-50 dark:hover:bg-gray-700 rounded-xl"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-0">
        
        
        <header className="bg-white dark:bg-gray-800 h-20 px-8 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200">
          <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500"><Menu /></button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
              </h2>
          </div>

          <div className="flex items-center gap-6">
            
            
            <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center bg-gray-50 dark:bg-gray-700 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-600 w-64 focus-within:ring-2 focus-within:ring-palmeGreen/20 transition-all">
                <Search size={18} className="text-gray-400" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Orders or Products..." 
                    className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700 dark:text-gray-200 placeholder-gray-400" 
                />
            </form>

            
            <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 text-gray-400 hover:text-palmeGreen transition-colors bg-gray-50 dark:bg-gray-700 hover:bg-green-50 rounded-full"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
                    )}
                </button>

                {notifOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-fade-in-up z-50 overflow-hidden">
                        <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                            <span className="font-bold text-sm text-gray-800 dark:text-white">Notifications</span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500">{unreadCount} New</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                            ) : (
                                notifications.map((notif, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => {
                                            navigate(notif.link);
                                            setNotifOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700/50 last:border-0 flex items-start gap-3 transition-colors"
                                    >
                                        <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${
                                            notif.type === 'stock' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                                        }`}>
                                            {notif.type === 'stock' ? <AlertCircle size={16} /> : <Clock size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{notif.subtext}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-gray-700">
              <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{adminName}</p>
                  <p className="text-xs text-green-600 font-medium">● Online</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-palmeGreen flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white dark:border-gray-600 ring-2 ring-gray-100 dark:ring-gray-700 uppercase">
                {adminName.substring(0, 2)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;