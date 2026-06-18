'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useCart();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user === null) {
      const storedUser = localStorage.getItem('customerData');
      if (!storedUser) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  const navLinks = [
    { name: 'Profile & Security', path: '/dashboard', icon: '👤' },
    { name: 'Order History', path: '/dashboard/orders', icon: '📦' },
    { name: 'Address Book', path: '/dashboard/addresses', icon: '📍' },
    { name: 'Payments & Wallets', path: '/dashboard/payments', icon: '💳' },
    { name: 'My Wishlist', path: '/dashboard/wishlist', icon: '❤️' },
    { name: 'My Reviews', path: '/dashboard/reviews', icon: '⭐' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('customerData');
    window.location.href = '/login';
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 80px)' }}>
      
      {/* Mobile Menu Toggle */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }} className="dashboard-mobile-nav">
        <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '20px' }}>Dashboard</h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {isMobileMenuOpen ? 'Close Menu' : 'Menu ☰'}
        </button>
      </div>

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '40px 15px' }}>
        
        {/* Responsive Grid Layout via inline styles (Desktop sidebar, mobile stack) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(250px, 1fr)', 
          gap: '30px',
          '@media (minWidth: 768px)': {
            gridTemplateColumns: '250px 1fr'
          }
        }} className="dashboard-grid">
          
          {/* Sidebar */}
          <aside style={{ 
            display: isMobileMenuOpen ? 'block' : 'none',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '20px',
            height: 'fit-content',
            position: 'sticky',
            top: '100px'
          }} className="dashboard-sidebar">
            
            <div style={{ marginBottom: '30px', textAlign: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-green)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#fff' }}>
                {user?.cust_name?.charAt(0) || 'U'}
              </div>
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 5px 0' }}>{user?.cust_name}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>{user?.cust_email}</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {navLinks.map(link => {
                const isActive = pathname === link.path;
                return (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      background: isActive ? 'var(--accent-green)' : 'transparent',
                      transition: 'all 0.2s',
                      fontWeight: isActive ? '600' : '400'
                    }}
                  >
                    <span>{link.icon}</span> {link.name}
                  </Link>
                );
              })}
              
              <button 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: '#ff4d4f',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '20px',
                  borderTop: '1px solid var(--glass-border)',
                  width: '100%'
                }}
              >
                <span>🚪</span> Logout
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main style={{ minHeight: '500px' }}>
            {children}
          </main>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-grid {
          display: block !important;
        }
        .dashboard-sidebar {
          display: none;
          margin-bottom: 20px;
        }
        @media (min-width: 768px) {
          .dashboard-grid {
            display: grid !important;
            grid-template-columns: 280px 1fr !important;
          }
          .dashboard-sidebar {
            display: block !important;
          }
          .dashboard-mobile-nav {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
