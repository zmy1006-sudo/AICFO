/**
 * AICFO MVP - 应用入口
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Vouchers from './pages/Vouchers';
import VoucherDetail from './pages/VoucherDetail';
import Calendar from './pages/Calendar';
import SalaryHome from './pages/SalaryHome';
import Employees from './pages/Employees';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import InvoiceOCR from './pages/InvoiceOCR';
import Contracts from './pages/Contracts';
import { useAppStore } from './store/useAppStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/vouchers" element={<ProtectedRoute><Vouchers /></ProtectedRoute>} />
        <Route path="/vouchers/:id" element={<ProtectedRoute><VoucherDetail /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute><SalaryHome /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/invoice" element={<ProtectedRoute><InvoiceOCR /></ProtectedRoute>} />
        <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
