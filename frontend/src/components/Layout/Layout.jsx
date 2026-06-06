import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundImage: 'url(/dashboard-bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Overlay to dim background and improve legibility */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(6, 11, 24, 0.88)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      
      <div style={{ display: 'flex', width: '100%', position: 'relative', zIndex: 2 }}>
        <Sidebar />
        <div className="main-content" style={{ flex: 1, marginLeft: '280px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          <div style={{ flex: 1, position: 'relative' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
