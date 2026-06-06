import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, User, LogOut, X, Info, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/vendors': 'Vendors',
  '/rfqs': "RFQ's",
  '/quotations': 'Quotations',
  '/approvals': 'Approvals',
  '/purchase-orders': 'Purchase Orders & Invoices',
  '/activity': 'Activity & Logs',
  '/reports': 'Reports & Analytics',
  '/assistant': 'AI Assistant',
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const pageTitle = routeTitles[location.pathname] ||
    routeTitles[Object.keys(routeTitles).find(k => location.pathname.startsWith(k))] ||
    'VendorBridge';

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  return (
    <header className="topbar" style={{ position: 'relative' }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{pageTitle}</h1>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: '8px 14px',
        width: 240,
      }}>
        <Search size={15} color="var(--text-muted)" />
        <input
          placeholder="Search..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 13, flex: 1,
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Go to Landing Page Link */}
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        padding: '8px 14px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}>
        <Home size={15} />
        <span>Go to Landing Page</span>
      </Link>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setNotifOpen(!notifOpen);
            setProfileOpen(false);
          }}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative',
          }}
        >
          <Bell size={17} color="var(--text-secondary)" />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: '#FF4757', border: '2px solid var(--bg-dark)',
          }} />
        </button>
        {notifOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 46,
            width: 280, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 14,
            padding: 16, zIndex: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
              Notifications
            </div>
            {[
              { msg: 'New quotation from TechCore Ltd', time: '2 min ago', color: '#3B82F6' },
              { msg: 'RFQ-2025-004 approved', time: '1 hr ago', color: '#10B981' },
              { msg: 'Invoice #INV-009 overdue', time: '3 hrs ago', color: '#EF4444' },
            ].map((n, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{n.msg}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Button and Dropdown */}
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => {
            setProfileOpen(!profileOpen);
            setNotifOpen(false);
          }}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer',
          }}
        >
          {user?.first_name?.[0] || 'U'}
        </div>

        {profileOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 46,
            width: 220, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 14,
            padding: '8px 0', zIndex: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}>
            {/* Header info */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>

            {/* Profile option */}
            <button
              onClick={() => {
                setShowProfileModal(true);
                setProfileOpen(false);
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', background: 'transparent', border: 'none',
                color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <User size={15} color="var(--primary-light)" />
              <span>Profile</span>
            </button>

            <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />

            {/* Logout option */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', background: 'transparent', border: 'none',
                color: '#EF4444', fontSize: 13, cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={15} color="#EF4444" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color="var(--primary-light)" />
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>User Profile</h3>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: 4 }}
                onClick={() => setShowProfileModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, color: 'white',
                }}>
                  {user?.first_name?.[0] || 'U'}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user?.first_name} {user?.last_name}
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {user?.role || 'Procurement Officer'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Email', value: user?.email },
                  { label: 'Phone', value: user?.phone || 'Not provided' },
                  { label: 'Country', value: user?.country || 'India' },
                  { label: 'Additional Info', value: user?.additional_info || 'None' }
                ].map(info => (
                  <div key={info.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{info.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                      {info.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
