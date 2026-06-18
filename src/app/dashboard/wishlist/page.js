'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // Mock wishlist data for now
    setWishlist([
      { id: 1, name: 'Organic Tomato Seeds', price: 15.00, inStock: true },
      { id: 2, name: 'Neem Oil Pesticide', price: 45.00, inStock: false },
    ]);
  }, []);

  const handleRemove = (id) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '24px', fontSize: '28px' }}>My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div style={{ background: 'var(--glass-bg)', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '20px' }}>Your wishlist is empty.</p>
          <Link href="/" style={{ background: 'var(--accent-green)', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {wishlist.map(item => (
            <div key={item.id} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '40px' }}>🌱</span>
              </div>
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 10px 0', fontSize: '18px' }}>{item.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '18px' }}>Rs. {item.price.toFixed(2)}</span>
                <span style={{ color: item.inStock ? '#52c41a' : '#ff4d4f', fontSize: '12px', fontWeight: 'bold' }}>
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                <button 
                  disabled={!item.inStock}
                  style={{ flex: 1, background: item.inStock ? 'var(--accent-green)' : '#444', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: item.inStock ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => handleRemove(item.id)}
                  style={{ width: '40px', background: 'transparent', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
