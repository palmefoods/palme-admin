import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, MapPin, List, LayoutGrid, Search, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      const orders = res.data;
      const customerMap = {};

      orders.forEach(order => {
        const email = order.customer?.email;
        if (!email) return;
        if (!customerMap[email]) {
          customerMap[email] = {
            id: order._id,
            name: order.customer.name,
            email: email,
            phone: order.customer.phone,
            address: order.customer.address,
            totalOrders: 0,
            totalSpent: 0,
            lastActive: order.date,
          };
        }
        customerMap[email].totalOrders += 1;
        customerMap[email].totalSpent += order.totalAmount;
        if (new Date(order.date) > new Date(customerMap[email].lastActive)) {
           customerMap[email].lastActive = order.date;
        }
      });
      setCustomers(Object.values(customerMap));
    } catch (err) {
      console.error("Error loading customers", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = rowsPerPage === 'All' ? filteredCustomers : filteredCustomers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = rowsPerPage === 'All' ? 1 : Math.ceil(filteredCustomers.length / rowsPerPage);
  const showStart = filteredCustomers.length === 0 ? 0 : (rowsPerPage === 'All' ? 1 : indexOfFirstRow + 1);
  const showEnd = rowsPerPage === 'All' ? filteredCustomers.length : Math.min(indexOfLastRow, filteredCustomers.length);

  return (
    <div className="space-y-6">
      
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
        <div>
           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Customers Directory</h2>
           <p className="text-sm text-gray-400">Manage your client base.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:border-palmeGreen dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" 
              placeholder="Search name or email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
             <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-palmeGreen dark:text-white' : 'text-gray-400 dark:text-gray-400'}`}><List size={20} /></button>
             <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-palmeGreen dark:text-white' : 'text-gray-400 dark:text-gray-400'}`}><LayoutGrid size={20} /></button>
          </div>
        </div>
      </div>

      
      {loading ? (
        <div className="p-12 text-center text-gray-400 animate-pulse">Loading Directory...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-12 text-center text-gray-400">No customers found.</div>
      ) : (
        <>
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-400 uppercase font-bold">
                  <tr><th className="p-4">Customer</th><th className="p-4">Contact</th><th className="p-4">Total Spent</th><th className="p-4">Orders</th><th className="p-4">Last Active</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentRows.map((c) => (
                    <tr key={c.email} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-palmeGreen dark:text-green-400 flex items-center justify-center font-bold">{c.name.charAt(0)}</div>
                          <span className="font-bold text-gray-800 dark:text-white">{c.name}</span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                          <div className="flex flex-col"><span className="text-xs">{c.email}</span><span className="text-xs text-gray-400 dark:text-gray-500">{c.phone}</span></div>
                      </td>
                      <td className="p-4 font-bold text-palmeGreen dark:text-green-400">₦{c.totalSpent.toLocaleString()}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{c.totalOrders}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-500 text-xs">{new Date(c.lastActive).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Show:</span>
                    <select className="border rounded p-1 bg-white dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none" value={rowsPerPage} onChange={(e) => { setRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value)); setCurrentPage(1); }}>
                        <option value={10}>10 rows</option>
                        <option value={20}>20 rows</option>
                        <option value={50}>50 rows</option>
                        <option value="All">All rows</option>
                    </select>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-bold text-gray-800 dark:text-white">{showStart}</span> to <span className="font-bold text-gray-800 dark:text-white">{showEnd}</span> of <span className="font-bold text-gray-800 dark:text-white">{filteredCustomers.length}</span>
                </div>
                {rowsPerPage !== 'All' && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50"><ChevronLeft size={16} /></button>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50"><ChevronRight size={16} /></button>
                    </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'grid' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentRows.map((customer) => (
                  <div key={customer.email} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4 mb-4 border-b border-gray-50 dark:border-gray-700 pb-4">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-palmeGreen dark:text-green-400"><User size={24} /></div>
                      <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">{customer.name}</h3>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} /> {customer.email}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Phone size={10} /> {customer.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Total Orders</span><span className="font-bold text-gray-800 dark:text-white">{customer.totalOrders}</span></div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Lifetime Value</span><span className="font-bold text-palmeGreen dark:text-green-400">₦{customer.totalSpent.toLocaleString()}</span></div>
                      <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-700 text-xs text-gray-400 flex items-center gap-2">
                        <MapPin size={12} /> {customer.address || "No Address"}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default Customers;