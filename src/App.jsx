import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';  
import Customers from './pages/Customers';  
import AdminLayout from './components/AdminLayout'; 
import ProductManager from './pages/ProductManager';
import LocationManager from './pages/LocationManager';
import SiteManager from './pages/SiteManager';
import Settings from './pages/Settings';
import OrderManager from './pages/OrderManager'; 
import Login from './pages/Login'; 
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';  


function App() {
  return (
    <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        
        
        <Route path="/login" element={<Login />} />

        
        <Route path="/*" element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<OrderManager />} />
                <Route path="/products" element={<ProductManager />} />
                <Route path="/locations" element={<LocationManager />} />
                <Route path="/site-content" element={<SiteManager />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/customers" element={<Customers />} /> 
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />
        
      </Routes>
    </Router>
  );
}

export default App;