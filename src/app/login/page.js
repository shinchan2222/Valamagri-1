'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import styles from './Auth.module.css';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { user, loginUser } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        loginUser(data);
        const savedRedirect = localStorage.getItem('redirect_after_login');
        if (savedRedirect) {
          localStorage.removeItem('redirect_after_login');
          router.push(savedRedirect);
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.authPage}`}>
      <div className={`glass ${styles.card}`}>
        <h2>Welcome Back</h2>
        <p>Login to purchase premium organic nutrients and controls</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                placeholder="yourname@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className={styles.toggleText}>
          Don&apos;t have an account? <Link href="/register">Create an Account</Link>
        </p>
      </div>
    </div>
  );
}
