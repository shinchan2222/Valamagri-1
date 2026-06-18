'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function ProfilePage() {
  const { user } = useCart();
  const [formData, setFormData] = useState({
    cust_name: '',
    cust_email: '',
    cust_phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        cust_name: user.cust_name || '',
        cust_email: user.cust_email || '',
        cust_phone: user.cust_phone || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Profile updated successfully (Mocked)', type: 'success' });
    // In a real implementation, this would send a POST/PUT to an API route to update tbl_customer
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    setMessage({ text: 'Password updated successfully (Mocked)', type: 'success' });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '24px', fontSize: '28px' }}>Profile & Security</h1>
      
      {message.text && (
        <div style={{ 
          padding: '12px 16px', 
          background: message.type === 'error' ? 'rgba(255, 77, 79, 0.1)' : 'rgba(82, 196, 26, 0.1)',
          border: `1px solid ${message.type === 'error' ? '#ff4d4f' : '#52c41a'}`,
          borderRadius: '8px',
          color: message.type === 'error' ? '#ff4d4f' : '#52c41a',
          marginBottom: '24px'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: '1fr' }}>
        
        {/* Personal Information */}
        <section style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '12px' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px', fontSize: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Personal Information</h2>
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
              <input 
                type="text" 
                value={formData.cust_name}
                onChange={e => setFormData({...formData, cust_name: e.target.value})}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email Address</label>
              <input 
                type="email" 
                value={formData.cust_email}
                onChange={e => setFormData({...formData, cust_email: e.target.value})}
                disabled
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#888', cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Email cannot be changed once verified.</small>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Phone Number</label>
              <input 
                type="tel" 
                value={formData.cust_phone}
                onChange={e => setFormData({...formData, cust_phone: e.target.value})}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
              />
            </div>
            <button type="submit" style={{ background: 'var(--accent-green)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start', marginTop: '10px' }}>
              Save Changes
            </button>
          </form>
        </section>

        {/* Security & Password */}
        <section style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '12px' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px', fontSize: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Security & Credentials</h2>
          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Current Password</label>
              <input 
                type="password" 
                value={passwordData.currentPassword}
                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>
            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start', marginTop: '10px' }}>
              Update Password
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section style={{ border: '1px solid rgba(255, 77, 79, 0.3)', padding: '24px', borderRadius: '12px', background: 'rgba(255, 77, 79, 0.05)' }}>
          <h2 style={{ color: '#ff4d4f', marginBottom: '10px', fontSize: '20px' }}>Danger Zone</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Once you delete your account, there is no going back. Please be certain.</p>
          <button style={{ background: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Deactivate Account
          </button>
        </section>

      </div>
    </div>
  );
}
