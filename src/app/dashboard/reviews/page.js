'use client';
import { useState, useEffect } from 'react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);

  useEffect(() => {
    // Mock data for reviews
    setReviews([
      { id: 1, productName: 'Organic Fertilizer 5kg', rating: 5, date: '2026-05-10', comment: 'Excellent product! My crops are healthier than ever.' }
    ]);
    setPendingReviews([
      { id: 2, productName: 'Neem Oil Pesticide', orderDate: '2026-06-12' }
    ]);
  }, []);

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '24px', fontSize: '28px' }}>Product Reviews</h1>
      
      <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: '1fr' }}>
        
        {/* Pending Reviews */}
        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '20px' }}>Waiting for your review</h2>
          {pendingReviews.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>You have no pending reviews.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingReviews.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '12px' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', margin: '0 0 5px 0', fontSize: '16px' }}>{item.productName}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>Purchased on {item.orderDate}</p>
                  </div>
                  <button style={{ background: 'var(--accent-green)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Write Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Reviews */}
        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '20px' }}>Your Past Reviews</h2>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>You haven&apos;t reviewed any products yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(item => (
                <div key={item.id} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '16px' }}>{item.productName}</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{item.date}</span>
                  </div>
                  <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '18px' }}>
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                  </div>
                  <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    &quot;{item.comment}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
