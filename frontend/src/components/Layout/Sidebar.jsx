import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, MessageSquare,
  CheckSquare, ShoppingCart, BarChart3,
  Activity, LogOut, Zap, Sparkles, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/vendors', icon: Users, label: 'Vendors' },
  { path: '/rfqs', icon: FileText, label: "RFQ's" },
  { path: '/quotations', icon: MessageSquare, label: 'Quotations' },
  { path: '/approvals', icon: CheckSquare, label: 'Approvals' },
  { path: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      style={{
        width: '280px',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#0A0F1C', // Deep dark blue/black
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
        fontFamily: "'Inter', sans-serif",
        zIndex: 50,
        overflowY: 'auto'
      }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'linear-gradient(135deg, #2563EB, #0ea5e9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
        }}>
          <Zap size={22} color="white" fill="white" />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px', fontFamily: "'PT Serif', serif" }}>
            VendorBridge
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Procurement
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px', marginBottom: '8px' }}>
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: isActive ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.15), transparent)' : 'transparent',
                color: isActive ? '#60A5FA' : '#94A3B8',
                borderLeft: isActive ? '4px solid #3B82F6' : '4px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ filter: isActive ? 'drop-shadow(0 0 8px rgba(96,165,250,0.5))' : 'none' }} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={16} />}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Highlighted AI Button */}
        <div style={{ marginTop: '24px', padding: '0 8px' }}>
          <NavLink
            to="/assistant"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 14,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 700,
              background: isActive 
                ? 'linear-gradient(135deg, #1E40AF, #3B82F6)' 
                : 'linear-gradient(135deg, rgba(30,64,175,0.2), rgba(59,130,246,0.1))',
              color: '#FFFFFF',
              border: '1px solid rgba(59,130,246,0.3)',
              boxShadow: isActive ? '0 8px 20px rgba(37,99,235,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            })}
          >
            {({ isActive }) => (
              <>
                <Sparkles size={20} color={isActive ? '#FFFFFF' : '#60A5FA'} fill={isActive ? '#FFFFFF' : 'transparent'} />
                <span>Ruixen AI Agent</span>
                <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 6, fontSize: 10 }}>PRO</div>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.5)' }}>
        <div 
          onClick={() => {
            import('react-hot-toast').then(mod => mod.default.success('Options coming soon!'));
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px', borderRadius: 14,
            background: 'rgba(255,255,255,0.03)', marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'pointer', transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        >
          <div style={{
            width: 38, height: 38, borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: 'white', flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            {user?.first_name?.[0] || 'U'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.first_name || 'Admin'} {user?.last_name || 'User'}
            </div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
              {user?.role || 'Procurement Manager'}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ 
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px', background: 'transparent', border: 'none', color: '#EF4444', 
            fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 8,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
