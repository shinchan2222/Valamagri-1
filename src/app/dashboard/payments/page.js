'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function PaymentsPage() {
  const { user } = useCart();
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [cards, setCards] = useState([]);
  const [redeemCode, setRedeemCode] = useState('');

  useEffect(() => {
    // In a real app, fetch from /api/dashboard/payments
    // Mocking saved data
    setCards([
      { id: 1, brand: 'Visa', last4: '4242', exp_month: '12', exp_year: '2025', is_default: 1 },
      { id: 2, brand: 'MasterCard', last4: '5555', exp_month: '08', exp_year: '2026', is_default: 0 }
    ]);
  }, []);

  const handleRedeem = (e) => {
    e.preventDefault();
    if (redeemCode === 'GIFT100') {
      setWalletBalance(prev => prev + 100);
      setRedeemCode('');
      alert('Rs. 100 added to your wallet!');
    } else {
      alert('Invalid gift card code.');
    }
  };

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '24px', fontSize: '28px' }}>Payments & Wallets</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* Wallet Section */}
        <section style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '12px' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '20px' }}>Store Credit / Wallet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Use your wallet balance for faster checkouts.</p>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center' }}>
            <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Current Balance</span>
            <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--accent-green)' }}>Rs. {walletBalance.toFixed(2)}</span>
          </div>

          <form onSubmit={handleRedeem} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Enter Gift Card Code" 
              value={redeemCode}
              onChange={e => setRedeemCode(e.target.value)}
              style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}
            />
            <button type="submit" style={{ background: 'var(--accent-green)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Redeem
            </button>
          </form>
        </section>

        {/* Saved Cards Section */}
        <section style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '20px' }}>Saved Cards</h2>
            <button style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
              + Add Card
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cards.map(card => (
              <div key={card.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '40px', height: '25px', background: card.brand === 'Visa' ? '#1a1f71' : '#ff5f00', borderRadius: '4px', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {card.brand}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontWeight: 'bold' }}>•••• •••• •••• {card.last4}</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>Expires {card.exp_month}/{card.exp_year}</p>
                  </div>
                </div>
                <div>
                  {card.is_default === 1 ? (
                    <span style={{ color: '#52c41a', fontSize: '12px', fontWeight: 'bold' }}>Default</span>
                  ) : (
                    <button style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
