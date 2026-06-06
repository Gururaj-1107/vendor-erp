import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQs from './pages/RFQs';
import Quotations from './pages/Quotations';
import QuotationComparison from './pages/QuotationComparison';
import Approvals from './pages/Approvals';
import PurchaseOrders from './pages/PurchaseOrders';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';
import Assistant from './pages/Assistant';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#12122A',
            color: '#E8E8FF',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/rfqs" element={<RFQs />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/quotations/compare/:rfqId" element={<QuotationComparison />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/activity" element={<ActivityLogs />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/assistant" element={<Assistant />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
