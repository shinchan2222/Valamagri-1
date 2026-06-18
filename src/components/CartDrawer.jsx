'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, Trash, ShoppingBag, CreditCard, Landmark, Leaf } from 'lucide-react';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const router = useRouter();
  const { cart, isOpen, setIsOpen, updateQty, removeFromCart, cartTotal, user, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, checkout, success
  const [payMethod, setPayMethod] = useState('Stripe');
  const [bankInfo, setBankInfo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    if (!user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirect_after_login', '/checkout');
      }
      setIsOpen(false);
      router.push('/login');
    } else {
      setIsOpen(false);
      router.push('/checkout');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.cust_id,
          payment_method: payMethod,
          paid_amount: cartTotal,
          bank_info: payMethod === 'Bank Deposit' ? bankInfo : '',
          cart: cart
        })
      });
      const data = await res.json();
      if (data.success) {
        setCheckoutStep('success');
        clearCart();
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (err) {
      console.error(err);
      alert('Network error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
      <div className={`glass ${styles.drawer}`}>
        {/* Header */}
        <div className={styles.header}>
          <h3>
            <ShoppingBag size={20} className={styles.headerIcon} />
            {checkoutStep === 'cart' && 'Your Shopping Cart'}
            {checkoutStep === 'checkout' && 'Secure Checkout'}
            {checkoutStep === 'success' && 'Order Placed!'}
          </h3>
          <button onClick={() => { setIsOpen(false); setCheckoutStep('cart'); }} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className={styles.emptyCart}>
                  <ShoppingBag size={48} className={styles.emptyIcon} />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className={styles.itemsList}>
                  {cart.map(item => (
                    <div key={item.p_id} className={`glass ${styles.itemCard}`}>
                      <img src={`/assets/uploads/${item.photo}`} alt={item.name} className={styles.itemImg} onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }} />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemPrice}>${item.price.toFixed(2)}</div>
                        <div className={styles.qtyRow}>
                          <div className={styles.qtyControl}>
                            <button onClick={() => updateQty(item.p_id, item.qty - 1)} className={styles.qtyBtn}>
                              <Minus size={12} />
                            </button>
                            <span className={styles.qtyVal}>{item.qty}</span>
                            <button onClick={() => updateQty(item.p_id, item.qty + 1)} className={styles.qtyBtn}>
                              <Plus size={12} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.p_id)} className={styles.removeBtn}>
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className={`glass ${styles.footerSummary}`}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span className={styles.totalVal}>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={handleCheckoutClick} className={styles.checkoutBtn}>
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </>
          )}

          {checkoutStep === 'checkout' && (
            <div className={styles.checkoutForm}>
              <h4 className={styles.sectionTitle}>Select Payment Method</h4>
              <div className={styles.methodsGrid}>
                <button 
                  onClick={() => setPayMethod('Stripe')} 
                  className={`${styles.methodBtn} ${payMethod === 'Stripe' ? styles.methodActive : ''}`}
                >
                  <CreditCard size={18} />
                  <span>Stripe</span>
                </button>
                <button 
                  onClick={() => setPayMethod('Bank Deposit')} 
                  className={`${styles.methodBtn} ${payMethod === 'Bank Deposit' ? styles.methodActive : ''}`}
                >
                  <Landmark size={18} />
                  <span>Bank Deposit</span>
                </button>
              </div>

              {payMethod === 'Bank Deposit' && (
                <div className={styles.bankFields}>
                  <label>Bank Transaction Details</label>
                  <textarea
                    placeholder="Enter Sender Account No., Transaction ID, Date..."
                    value={bankInfo}
                    onChange={(e) => setBankInfo(e.target.value)}
                    className={styles.textarea}
                    rows={4}
                  />
                </div>
              )}

              <div className={`glass ${styles.checkoutSummary}`}>
                <div className={styles.summaryRow}>
                  <span>Total Amount:</span>
                  <span className={styles.totalVal}>${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handlePlaceOrder} 
                  disabled={loading} 
                  className={styles.checkoutBtn}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className={styles.successScreen}>
              <div className={styles.successIconWrapper}>
                <Leaf size={48} className={styles.successIcon} />
              </div>
              <h4>Thank you for your order!</h4>
              <p>Your organic farming supplies will be prepared for delivery shortly. You can track this in your dashboard.</p>
              <button 
                onClick={() => { setIsOpen(false); setCheckoutStep('cart'); }} 
                className={styles.checkoutBtn}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
