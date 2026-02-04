import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, Eye, ChevronLeft, ChevronRight, Filter, PlusCircle, Trash2, X, Package, User, MapPin, Calendar, Printer, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus || 'Pending');
  };

 const handleUpdateStatus = async () => {
  if (!selectedOrder) return;
  setUpdatingStatus(true);
  try {
      const res = await axios.put(`${API_URL}/api/orders/${selectedOrder._id}`, {
          status: newStatus 
      });
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? res.data : o));
      setSelectedOrder(res.data);
      toast.success(`Order updated to ${newStatus}`);
  } catch (err) {
      toast.error("Failed to update status");
  } finally {
      setUpdatingStatus(false);
  }
};

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    const invoiceWindow = window.open('', 'PRINT', 'height=800,width=800');
    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${selectedOrder._id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a4d2e; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #1a4d2e; }
            .item-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .item-table th { background: #f4f4f4; padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .item-table td { padding: 10px; border-bottom: 1px solid #eee; }
            .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; color: #1a4d2e; }
          </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">PALME FOODS</div>
                <div>Invoice #${selectedOrder._id.slice(-6).toUpperCase()}</div>
            </div>
            <p><strong>Customer:</strong> ${selectedOrder.customer?.name}</p>
            <p><strong>Phone:</strong> ${selectedOrder.customer?.phone}</p>
            <p><strong>Date:</strong> ${new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            
            <table class="item-table">
                <thead>
                    <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
                </thead>
                <tbody>
                    ${selectedOrder.items?.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.qty || item.quantity}</td>
                            <td>₦${item.price.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">Total Amount: ₦${selectedOrder.totalAmount.toLocaleString()}</div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); 
    if(!window.confirm("Delete this order?")) return;
    try {
        await axios.delete(`${API_URL}/api/orders/${id}`);
        setOrders(prev => prev.filter(o => o._id !== id));
        toast.success("Order deleted");
    } catch (err) {
        toast.error("Delete failed");
    }
  };

  const generateTestOrder = async () => {
    const randomNum = Math.floor(Math.random() * 1000);
    const dummyOrder = {
      customer: { name: `Test User ${randomNum}`, email: `test${randomNum}@gmail.com`, phone: "08012345678", address: "Test Address" },
      items: [{ name: "Palm Oil 5L", qty: 2, price: 12500 }],
      totalAmount: 25000,
      deliveryMethod: 'doorstep',
      paymentReference: 'TEST_' + Date.now()
    };
    try { 
        await axios.post(`${API_URL}/api/orders`, dummyOrder); 
        fetchOrders(); 
        toast.success("Test order added");
    } catch (err) { toast.error("Check console - check Paystack logic"); }
  };

  const filteredOrders = orders.filter(order => {
    const displayId = order._id.slice(-6).toUpperCase();
    const query = searchTerm.replace('#', '').toLowerCase();
    const matchesSearch = 
      order._id.toLowerCase().includes(query) ||
      displayId.toLowerCase().includes(query) ||
      (order.customer?.name || "").toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = rowsPerPage === 'All' ? filteredOrders : filteredOrders.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = rowsPerPage === 'All' ? 1 : Math.ceil(filteredOrders.length / rowsPerPage);
  const showStart = filteredOrders.length === 0 ? 0 : (rowsPerPage === 'All' ? 1 : indexOfFirstRow + 1);
  const showEnd = rowsPerPage === 'All' ? filteredOrders.length : Math.min(indexOfLastRow, filteredOrders.length);

  const handleExportCSV = () => {
    const headers = ["Order ID,Customer Name,Date,Total,Status"];
    const rows = filteredOrders.map(o => `${o._id},${o.customer?.name || "Guest"},${new Date(o.createdAt).toLocaleDateString()},${o.totalAmount},${o.orderStatus}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", "palme_orders.csv"); document.body.appendChild(link); link.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Processing': return 'bg-orange-100 text-orange-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Order ID (#78A...) or Name" 
            className="w-full pl-10 p-2.5 border rounded-lg focus:outline-none focus:border-palmeGreen dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto items-center">
           <button onClick={generateTestOrder} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-black transition-colors text-xs uppercase tracking-wider"><PlusCircle size={16} /> Test Order</button>

          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-500" size={16} />
            <select 
              className="pl-9 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-palmeGreen text-white px-4 py-2.5 rounded-lg font-bold hover:bg-green-800 transition-colors">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading Orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 text-gray-500 dark:text-gray-300 uppercase font-bold">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentRows.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => handleOpenModal(order)}>
                    <td className="p-4 font-mono text-xs text-gray-500 dark:text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">{order.customer?.name || "Unknown"}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{order.items?.length || 0} Items</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">₦{order.totalAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenModal(order); }} className="text-gray-400 hover:text-palmeGreen p-2"><Eye size={18} /></button>
                      <button onClick={(e) => handleDelete(order._id, e)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="p-4 border-t dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-700/50">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Show:</span>
              <select className="border rounded p-1 bg-white dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={rowsPerPage} onChange={(e) => { setRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value)); setCurrentPage(1); }}>
                <option value={10}>10 rows</option><option value={20}>20 rows</option><option value={50}>50 rows</option><option value="All">All rows</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-bold">{showStart}</span> to <span className="font-bold">{showEnd}</span> of <span className="font-bold">{filteredOrders.length}</span> orders
            </div>
            {rowsPerPage !== 'All' && (
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"><ChevronLeft size={16} /></button>
                <span className="text-sm font-bold">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up transition-colors">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-700/50 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus || 'Pending'}
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar size={14} /> Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                <X className="text-gray-500 dark:text-gray-400" size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 pb-2">Customer Details</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400"><User size={18} /></div>
                            <div>
                                <p className="font-bold dark:text-white">{selectedOrder.customer?.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.customer?.email}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.customer?.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-orange-50 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400"><MapPin size={18} /></div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{selectedOrder.customer?.address || "No Address Provided"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 pb-2">Items Ordered</h3>
                    <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
                        {selectedOrder.items?.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-gray-600 p-2 rounded border dark:border-gray-500 text-gray-400"><Package size={16} /></div>
                                    <div>
                                        <p className="font-bold text-sm dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.qty || item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-bold dark:text-white">₦{(item.price * (item.qty || item.quantity)).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                    
                    
                    <div className="mt-4 space-y-2 border-t dark:border-gray-700 pt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium dark:text-gray-200">
                                ₦{(selectedOrder.subtotal || selectedOrder.items.reduce((acc, i) => acc + (i.price * (i.qty||i.quantity)), 0)).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Shipping Fee {selectedOrder.totalWeight ? `(${selectedOrder.totalWeight}kg)` : ''}</span>
                            <span className="font-medium dark:text-gray-200">₦{selectedOrder.shippingFee?.toLocaleString() || '0'}</span>
                        </div>
                        
                        {selectedOrder.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span>-₦{selectedOrder.discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        
                        {selectedOrder.tipAmount > 0 && (
                            <div className="flex justify-between text-sm text-orange-500">
                                <span>Tip</span>
                                <span>+₦{selectedOrder.tipAmount.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700 mt-2">
                            <span className="text-gray-900 dark:text-white font-bold text-lg">Total Paid</span>
                            <span className="text-2xl font-bold text-palmeGreen">₦{selectedOrder.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <button onClick={handlePrintInvoice} className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-100 transition-colors w-full md:w-auto justify-center">
                    <Printer size={18} /> Print Invoice
                </button>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="p-3 border rounded-xl bg-white dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:border-palmeGreen font-medium text-gray-700 w-full md:w-48"
                    >
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleUpdateStatus}
                        disabled={updatingStatus}
                        className="px-6 py-3 bg-palmeGreen text-white font-bold rounded-xl hover:bg-green-800 transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap"
                    >
                        {updatingStatus ? "Saving..." : <><CheckCircle size={18} /> Update Status</>}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;