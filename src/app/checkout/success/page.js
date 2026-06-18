'use client';
import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import styles from '../Checkout.module.css';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('order') || 'UNKNOWN';

    return (
        <div className={styles.successContainer}>
            <div className={styles.successCard}>
                <CheckCircleIcon className={styles.successIcon} />
                <h1 className={styles.pageTitle} style={{marginBottom: '10px'}}>Order Confirmed!</h1>
                <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem'}}>
                    Thank you for your purchase. Your order has been received and is now being processed.
                </p>
                
                <div className={styles.orderIdBox}>
                    Order ID: {orderId}
                </div>
                
                <button onClick={() => router.push('/')} className={styles.checkoutBtn}>
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className={styles.successContainer}>Loading Order Details...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}

