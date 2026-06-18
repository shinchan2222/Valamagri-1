'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { CheckIcon } from '@heroicons/react/24/solid';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
    const { cart, cartTotal, user, clearCart, setIsOpen, isInitialized } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Flipkart style checkout state
    const [activeStep, setActiveStep] = useState(2); // Step 1 is Login, which is already complete

    const [deliveryDetails, setDeliveryDetails] = useState({
        name: '', email: '', phone: '', address: '', city: '', method: 'Credit Card'
    });

    useEffect(() => {
        if (!isInitialized) return; // Wait for CartContext to finish loading from localStorage

        if (!user) {
            router.push('/login?redirect=/checkout');
        } else {
            setDeliveryDetails(prev => ({
                ...prev,
                name: user.cust_name || '', email: user.cust_email || '', phone: user.cust_phone || '',
                address: user.cust_address || '', city: user.cust_city || ''
            }));
            setIsOpen(false);
        }
    }, [user, router, setIsOpen, isInitialized]);

    if (!user) return null;

    if (cart.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h2 className={styles.pageTitle}>Your Cart is Empty</h2>
                <button onClick={() => router.push('/')} className={styles.checkoutBtn} style={{maxWidth: '300px'}}>
                    Return to Shop
                </button>
            </div>
        );
    }

    const handleChange = (e) => setDeliveryDetails({ ...deliveryDetails, [e.target.name]: e.target.value });

    // Step Continue Handlers
    const handleContinueDelivery = (e) => {
        e.preventDefault();
        // Simple validation
        if(deliveryDetails.name && deliveryDetails.address && deliveryDetails.phone && deliveryDetails.city) {
            setActiveStep(3);
        } else {
            alert('Please fill out all delivery fields');
        }
    };

    const handleContinueSummary = () => {
        setActiveStep(4);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { customer_id: user.cust_id || user.id, delivery_details: deliveryDetails, cart_items: cart, total_amount: cartTotal };
            const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (response.ok) { clearCart(); router.push(`/checkout/success?order=${result.orderId}`); } 
            else { alert(`Error: ${result.error}\nRaw Payload Sent: ${result.raw}`); }
        } catch (error) { alert("An error occurred during checkout."); } 
        finally { setLoading(false); }
    };

    return (
        <div className={styles.checkoutContainer}>
            <div className={styles.checkoutLayout}>
                {/* Left side: Accordion Steps */}
                <div className={styles.stepsContainer}>
                    
                    {/* Step 1: LOGIN (Completed) */}
                    <div className={styles.stepCard}>
                        <div className={styles.stepHeader}>
                            <div>
                                <div className={styles.stepHeaderTitle} style={{color: 'var(--text-primary)'}}>
                                    <span className={styles.stepNumber} style={{background: 'var(--bg-tertiary)', color: 'var(--text-muted)'}}>1</span>
                                    LOGIN
                                    <CheckIcon className={styles.stepCheckmark} width={20} height={20} />
                                </div>
                                <div className={styles.stepSummary}>
                                    <span style={{fontWeight: 600, color: 'var(--text-primary)', marginRight: '8px'}}>{user.cust_name || 'User'}</span>
                                    <span>+91{user.cust_phone || '9876543210'}</span>
                                </div>
                            </div>
                            {activeStep !== 1 && (
                                <button className={styles.changeBtn} onClick={() => alert('Logout from dashboard to switch accounts')}>CHANGE</button>
                            )}
                        </div>
                    </div>

                    {/* Step 2: DELIVERY ADDRESS */}
                    <div className={styles.stepCard}>
                        <div className={`${styles.stepHeader} ${activeStep === 2 ? styles.stepHeaderActive : ''}`} 
                             onClick={() => activeStep > 2 && setActiveStep(2)}>
                            <div>
                                <div className={styles.stepHeaderTitle}>
                                    <span className={styles.stepNumber}>2</span>
                                    DELIVERY ADDRESS
                                    {activeStep > 2 && <CheckIcon className={styles.stepCheckmark} width={20} height={20} />}
                                </div>
                                {activeStep > 2 && (
                                    <div className={styles.stepSummary}>
                                        <span style={{fontWeight: 600, color: 'var(--text-primary)'}}>{deliveryDetails.name}</span><br />
                                        {deliveryDetails.address}, {deliveryDetails.city} - {deliveryDetails.phone}
                                    </div>
                                )}
                            </div>
                            {activeStep > 2 && (
                                <button className={styles.changeBtn} onClick={(e) => { e.stopPropagation(); setActiveStep(2); }}>CHANGE</button>
                            )}
                        </div>

                        {activeStep === 2 && (
                            <div className={styles.stepBody}>
                                <form onSubmit={handleContinueDelivery}>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Full Name</label>
                                            <input required type="text" name="name" value={deliveryDetails.name} onChange={handleChange} className={styles.input} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Phone Number</label>
                                            <input required type="text" name="phone" value={deliveryDetails.phone} onChange={handleChange} className={styles.input} />
                                        </div>
                                    </div>
                                    
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Email Address</label>
                                            <input required type="email" name="email" value={deliveryDetails.email} onChange={handleChange} className={styles.input} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>City</label>
                                            <input required type="text" name="city" value={deliveryDetails.city} onChange={handleChange} className={styles.input} />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Address</label>
                                        <textarea required name="address" rows="3" value={deliveryDetails.address} onChange={handleChange} className={styles.input}></textarea>
                                    </div>

                                    <button type="submit" className={styles.checkoutBtn} style={{width: 'auto', padding: '14px 32px'}}>
                                        DELIVER HERE
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Step 3: ORDER SUMMARY */}
                    <div className={styles.stepCard}>
                        <div className={`${styles.stepHeader} ${activeStep === 3 ? styles.stepHeaderActive : ''}`}
                             onClick={() => activeStep > 3 && setActiveStep(3)}>
                            <div>
                                <div className={styles.stepHeaderTitle}>
                                    <span className={styles.stepNumber}>3</span>
                                    ORDER SUMMARY
                                    {activeStep > 3 && <CheckIcon className={styles.stepCheckmark} width={20} height={20} />}
                                </div>
                                {activeStep > 3 && (
                                    <div className={styles.stepSummary}>
                                        {cart.length} Item(s)
                                    </div>
                                )}
                            </div>
                            {activeStep > 3 && (
                                <button className={styles.changeBtn} onClick={(e) => { e.stopPropagation(); setActiveStep(3); }}>CHANGE</button>
                            )}
                        </div>
                        
                        {activeStep === 3 && (
                            <div className={styles.stepBody}>
                                {cart.map((item, idx) => (
                                    <div key={idx} className={styles.cartItem}>
                                        <img src={`/assets/uploads/${item.photo}`} alt={item.name} className={styles.itemImage} onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Img'; }} />
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemName}>{item.name}</div>
                                            <div className={styles.itemQty} style={{marginTop: '4px'}}>Qty: <span style={{fontWeight: 500, color: 'var(--text-primary)'}}>{item.qty}</span></div>
                                        </div>
                                        <div className={styles.itemPrice} style={{fontSize: '1.1rem'}}>Rs. {(item.price * item.qty).toFixed(2)}</div>
                                    </div>
                                ))}
                                
                                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
                                    <button onClick={handleContinueSummary} className={styles.checkoutBtn} style={{width: 'auto', padding: '14px 32px'}}>
                                        CONTINUE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 4: PAYMENT OPTIONS */}
                    <div className={styles.stepCard}>
                        <div className={`${styles.stepHeader} ${activeStep === 4 ? styles.stepHeaderActive : ''}`}>
                            <div className={styles.stepHeaderTitle}>
                                <span className={styles.stepNumber}>4</span>
                                PAYMENT OPTIONS
                            </div>
                        </div>

                        {activeStep === 4 && (
                            <div className={styles.stepBody}>
                                <form onSubmit={handlePlaceOrder}>
                                    <div className={styles.formGroup} style={{marginBottom: '30px'}}>
                                        <label className={styles.label} style={{marginBottom: '15px'}}>Select a Payment Method</label>
                                        
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                            {['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'].map((method) => (
                                                <label key={method} style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', background: deliveryDetails.method === method ? 'var(--bg-tertiary)' : 'transparent', borderRadius: '8px', border: deliveryDetails.method === method ? '1px solid var(--accent-green)' : '1px solid transparent'}}>
                                                    <input 
                                                        type="radio" 
                                                        name="method" 
                                                        value={method} 
                                                        checked={deliveryDetails.method === method} 
                                                        onChange={handleChange} 
                                                        style={{accentColor: 'var(--accent-green)', width: '18px', height: '18px'}}
                                                    />
                                                    <span style={{fontWeight: deliveryDetails.method === method ? '600' : '400', color: 'var(--text-primary)'}}>{method}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} className={styles.checkoutBtn} style={{width: 'auto', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        {loading ? 'PROCESSING...' : `CONFIRM ORDER`}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Fixed Price Details */}
                <div className={styles.orderSummary}>
                    <h2 className={styles.sectionTitle} style={{textTransform: 'uppercase', fontSize: '1.1rem', color: 'var(--text-secondary)'}}>PRICE DETAILS</h2>

                    <div className={styles.summaryRow}>
                        <span>Price ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                        <span>Rs. {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Delivery Charges</span>
                        <span style={{ color: 'var(--accent-green)' }}>Free</span>
                    </div>
                    <div className={styles.summaryTotal}>
                        <span>Amount Payable</span>
                        <span>Rs. {cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div style={{marginTop: '20px', color: 'var(--accent-green)', fontWeight: '600', fontSize: '0.9rem'}}>
                        Your total savings on this order is Rs. 0.00
                    </div>
                </div>
            </div>
        </div>
    );
}
