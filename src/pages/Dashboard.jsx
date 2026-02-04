import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, ShoppingBag, Users, Clock, Award, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]); 
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await axios.get(`${API_URL}/api/orders`);
        const orders = orderRes.data;

        
        const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const uniqueCustomers = new Set(orders.map(o => o.customer?.email)).size;
        const pendingCount = orders.filter(o => o.status === 'Pending').length;

        setStats({
          revenue: totalRevenue,
          orders: orders.length,
          customers: uniqueCustomers,
          pending: pendingCount
        });

        
        const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(sortedOrders.slice(0, 5));

        
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0]; 
        }).reverse();

        const realChartData = last7Days.map(dateStr => {
            const daySales = orders
                .filter(o => o.createdAt && o.createdAt.startsWith(dateStr))
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            
            const displayDate = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return { name: displayDate, sales: daySales };
        });
        setChartData(realChartData);

        
        const productMap = {};
        orders.forEach(order => {
            if(order.items) {
                order.items.forEach(item => {
                    const qty = item.qty || item.quantity || 1;
                    if(!productMap[item.name]) productMap[item.name] = 0;
                    productMap[item.name] += qty;
                });
            }
        });
        const sortedProducts = Object.entries(productMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); 
        setTopProducts(sortedProducts);

        
        const customerMap = {};
        orders.forEach(order => {
            if(order.customer && order.customer.email) {
                const email = order.customer.email;
                if(!customerMap[email]) customerMap[email] = { name: order.customer.name, spent: 0, count: 0 };
                customerMap[email].spent += order.totalAmount;
                customerMap[email].count += 1;
            }
        });
        const sortedCustomers = Object.values(customerMap)
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 5); 
        setTopCustomers(sortedCustomers);

      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500 dark:text-gray-400">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<TrendingUp />} label="Total Revenue" value={`₦${stats.revenue.toLocaleString()}`} color="bg-green-100 text-green-700" />
        <StatCard icon={<ShoppingBag />} label="Total Orders" value={stats.orders} color="bg-blue-100 text-blue-700" />
        <StatCard icon={<Users />} label="Active Customers" value={stats.customers} color="bg-purple-100 text-purple-700" />
        <StatCard icon={<Clock />} label="Pending Orders" value={stats.pending} color="bg-orange-100 text-orange-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-700 dark:text-white mb-6">Sales Performance (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a4d2e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1a4d2e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <Tooltip 
                    formatter={(value) => [`₦${value.toLocaleString()}`, "Sales"]}
                    contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px' }} 
                />
                <Area type="monotone" dataKey="sales" stroke="#1a4d2e" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-700 dark:text-white mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.length === 0 ? <p className="text-gray-400 text-sm">No orders yet.</p> : recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-50 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"><ShoppingBag size={16} className="text-gray-500 dark:text-gray-400" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{order.customer?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-palmeGreen">₦{order.totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">{new Date(order.createdAt || order.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="text-palmeGreen" size={20}/> Most Sold Products
                </h3>
                <div className="space-y-3">
                    {topProducts.length === 0 ? <p className="text-gray-400 text-sm">No sales yet.</p> : topProducts.map((p, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-400 text-xs">#{i+1}</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-white">{p.name}</span>
                            </div>
                            <span className="text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                                {p.count} Sold
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="text-yellow-500" size={20}/> Loyalty Leaderboard
                </h3>
                <div className="space-y-3">
                    {topCustomers.length === 0 ? <p className="text-gray-400 text-sm">No customers yet.</p> : topCustomers.map((c, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-400 text-xs">#{i+1}</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-white">{c.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-palmeGreen">₦{c.spent.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400">{c.count} Orders</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

      </div>

    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-xs font-bold uppercase mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
  </div>
);

export default Dashboard;