'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.cust_id) {
      fetch(`/api/dashboard/orders?customer_id=${user.cust_id}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data.data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  const getStepLevel = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING') return 1;
    if (s === 'PROCESSING') return 2;
    if (s === 'SHIPPED') return 3;
    if (s === 'DELIVERED' || s === 'COMPLETED') return 4;
    return 1;
  };

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '24px', fontSize: '28px' }}>Order History</h1>
      
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ background: 'var(--glass-bg)', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
          <Link href="/" style={{ background: 'var(--accent-green)', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(order => {
            const step = getStepLevel(order.shipping_status);
            return (
              <div key={order.id} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>Order ID: {order.payment_id}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Placed on: {order.payment_date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs. {order.paid_amount}</p>
                    <a href={`/admin/invoice.html?id=${order.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '6px 12px', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
                      Download Invoice
                    </a>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '24px' }}>
                  {order.products?.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i === order.products.length - 1 ? 'none' : '1px dashed rgba(255,255,255,0.1)' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{p.quantity}x {p.product_name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>Rs. {(parseFloat(p.unit_price) * parseInt(p.quantity)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Live Tracking Progress Bar */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)', fontSize: '14px' }}>Live Order Tracking</h4>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Progress Line */}
                    <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}>
                      <div style={{ height: '100%', background: 'var(--accent-green)', width: `${((step - 1) / 3) * 100}%`, transition: 'width 0.5s ease' }}></div>
                    </div>

                    {/* Steps */}
                    {['Pending', 'Processing', 'Shipped', 'Delivered'].map((statusLabel, index) => {
                      const isActive = step >= (index + 1);
                      return (
                        <div key={statusLabel} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '25%' }}>
                          <div style={{ 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%', 
                            background: isActive ? 'var(--accent-green)' : '#333', 
                            border: `4px solid ${isActive ? 'var(--glass-bg)' : '#222'}`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            transition: 'all 0.3s'
                          }}>
                            {isActive ? '✓' : index + 1}
                          </div>
                          <span style={{ fontSize: '12px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isActive ? 'bold' : 'normal' }}>
                            {statusLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                    Request Return / Help
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
