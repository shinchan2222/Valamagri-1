'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { ShieldCheck, UserCheck, Truck, X } from 'lucide-react';
import styles from './page.module.css';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const tcat = searchParams.get('tcat');
  const mcat = searchParams.get('mcat');
  const ecat = searchParams.get('ecat');
  const search = searchParams.get('search');

  useEffect(() => {
    setLoading(true);
    let url = '/api/products';
    const params = [];
    if (tcat) params.push(`tcat=${tcat}`);
    if (mcat) params.push(`mcat=${mcat}`);
    if (ecat) params.push(`ecat=${ecat}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [tcat, mcat, ecat, search]);

  const clearFilters = () => {
    router.push('/');
  };

  const getActiveFilterLabel = () => {
    if (search) return `Search: "${search}"`;
    if (tcat === '1') return 'Organic Fertilizers';
    if (tcat === '2') return 'Organic Pesticides';
    if (mcat) return 'Category Filter';
    if (ecat) return 'Subcategory Filter';
    return '';
  };

  const activeLabel = getActiveFilterLabel();

  return (
    <div className={styles.home}>
      {/* Slideshow */}
      {!search && !tcat && !mcat && !ecat && <Hero />}

      {/* Trust Badges */}
      <section className={styles.badgesSection}>
        <div className={`container ${styles.badgesGrid}`}>
          <div className={`glass ${styles.badgeCard}`}>
            <ShieldCheck size={36} className={styles.badgeIcon} />
            <div className={styles.badgeInfo}>
              <h4>100% OMRI Certified</h4>
              <p>All products are certified organic and safe for garden use.</p>
            </div>
          </div>
          <div className={`glass ${styles.badgeCard}`}>
            <UserCheck size={36} className={styles.badgeIcon} />
            <div className={styles.badgeInfo}>
              <h4>Expert Grower Advice</h4>
              <p>Speak to our horticulturists for custom crop solutions.</p>
            </div>
          </div>
          <div className={`glass ${styles.badgeCard}`}>
            <Truck size={36} className={styles.badgeIcon} />
            <div className={styles.badgeInfo}>
              <h4>Eco-Friendly Shipping</h4>
              <p>We package in recyclable and biodegradable materials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Catalog */}
      <section className={styles.catalogSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2>{activeLabel ? 'Filtered Catalog' : 'Our Organic Solutions'}</h2>
              <p>{activeLabel ? `Showing products matching filters` : 'Top-tier certified organic fertilizers and natural biological controls.'}</p>
            </div>
            {activeLabel && (
              <button onClick={clearFilters} className={styles.clearBtn}>
                <span>{activeLabel}</span> <X size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.loaderGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`glass ${styles.skeletonCard}`}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonText} style={{ width: '40%' }} />
                  <div className={styles.skeletonText} style={{ width: '80%' }} />
                  <div className={styles.skeletonText} style={{ width: '60%' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className={styles.noProducts}>
                  <p>No products found matching your request.</p>
                  <button onClick={clearFilters} className={styles.resetBtn}>Reset Search Filters</button>
                </div>
              ) : (
                <div className={styles.productsGrid}>
                  {products.map(p => (
                    <ProductCard key={p.p_id} product={p} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading ValamAgri Organic Store...</div>}>
      <HomeContent />
    </Suspense>
  );
}
