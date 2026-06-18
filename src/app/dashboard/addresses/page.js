'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function AddressesPage() {
  const { user } = useCart();
  const [addresses, setAddresses] = useState([]);
  
  useEffect(() => {
    // In a real scenario, fetch from /api/dashboard/addresses
    // For now, we populate from user context (the primary shipping address)
    if (user) {
      setAddresses([
        {
          id: 1,
          label: 'Default Shipping Address',
          address: user.cust_s_address,
          city: user.cust_s_city,
          state: user.cust_s_state,
          zip: user.cust_s_zip,
          country: user.cust_s_country,
          phone: user.cust_s_phone,
          is_default: 1
        }
      ]);
    }
  }, [user]);

  const handleDelete = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '28px' }}>Address Book</h1>
        <button style={{ background: 'var(--accent-green)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Add New Address
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {addresses.map((addr) => (
          <div key={addr.id} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '12px', position: 'relative' }}>
            {addr.is_default === 1 && (
              <span style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(82, 196, 26, 0.2)', color: '#52c41a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                Primary
              </span>
            )}
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 10px 0' }}>{addr.label}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 5px 0' }}>{user?.cust_name}</p>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 5px 0' }}>{addr.address || 'No address provided'}</p>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 5px 0' }}>
              {addr.city ? `${addr.city}, ` : ''}{addr.state} {addr.zip}
            </p>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 15px 0' }}>Phone: {addr.phone || user?.cust_phone}</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
              <button style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(addr.id)} style={{ flex: 1, background: 'transparent', border: '1px solid #ff4d4f', color: '#ff4d4f', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
