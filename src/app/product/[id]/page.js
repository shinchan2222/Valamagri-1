'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingBag, ArrowLeft, ShieldCheck, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

export default function ProductDetail({ params }) {
  const unwrappedParams = React.use(params);
  const productId = unwrappedParams.id;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetch(`/api/products?id=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProduct(data);
          setSelectedPhoto(data.p_featured_photo);
        }
      })
      .catch(err => console.error(err))
      .finally(() => {
        setLoading(false);
        // Force scroll to top after the full DOM paints to prevent jumping
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Loading product details...</h3>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h3>Product not found</h3>
        <Link href="/" style={{ color: 'var(--accent-green)', marginTop: '20px', display: 'inline-block' }}>
          Back to home
        </Link>
      </div>
    );
  }

  const savings = product.p_old_price 
    ? Math.round(((parseFloat(product.p_old_price) - parseFloat(product.p_current_price)) / parseFloat(product.p_old_price)) * 100)
    : 0;

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} size={16} style={{ color: 'var(--accent-gold)', fill: 'var(--accent-gold)' }} />);
      } else {
        stars.push(<Star key={i} size={16} style={{ color: 'var(--text-muted)' }} />);
      }
    }
    return stars;
  };

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className={styles.grid}>
        {/* Left: Gallery */}
        <div className={styles.gallery}>
          <div className={`glass ${styles.mainImgWrapper}`}>
            {savings > 0 && <span className={styles.savingsBadge}>-{savings}% OFF</span>}
            <img src={`/assets/uploads/${selectedPhoto}`} alt={product.p_name} className={styles.mainImg} onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=No+Image'; }} />
          </div>
          
          {product.photos && product.photos.length > 0 && (
            <div className={styles.thumbnails}>
              <div 
                onClick={() => setSelectedPhoto(product.p_featured_photo)} 
                className={`${styles.thumbWrapper} ${selectedPhoto === product.p_featured_photo ? styles.thumbActive : ''}`}
              >
                <img src={`/assets/uploads/${product.p_featured_photo}`} alt="" onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }} />
              </div>
              {product.photos.map((ph, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedPhoto(ph)} 
                  className={`${styles.thumbWrapper} ${selectedPhoto === ph ? styles.thumbActive : ''}`}
                >
                  <img src={`/assets/uploads/${ph}`} alt="" onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className={styles.info}>
          <span className={styles.organicTag}>OMRI Organic Certified</span>
          <h1 className={styles.title}>{product.p_name}</h1>

          {/* Rating Row */}
          <div className={styles.ratingRow}>
            <div className={styles.stars}>{renderStars(product.avg_rating)}</div>
            {product.avg_rating > 0 ? (
              <span className={styles.ratingText}>{product.avg_rating.toFixed(1)} out of 5 stars ({product.ratings.length} reviews)</span>
            ) : (
              <span className={styles.ratingText}>No reviews yet</span>
            )}
            <span className={styles.viewsText}>
              <Eye size={14} /> {product.p_total_view} views
            </span>
          </div>

          {/* Price */}
          <div className={styles.priceContainer}>
            <span className={styles.price}>${parseFloat(product.p_current_price).toFixed(2)}</span>
            {product.p_old_price && (
              <span className={styles.oldPrice}>${parseFloat(product.p_old_price).toFixed(2)}</span>
            )}
          </div>

          <p className={styles.shortDesc}>{product.p_short_description}</p>

          {/* Qty & Add to Cart */}
          <div className={styles.actionsRow}>
            <div className={styles.qtySelector}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className={styles.qtyBtn}>-</button>
              <span className={styles.qtyVal}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className={styles.qtyBtn}>+</button>
            </div>
            
            <button onClick={() => addToCart(product, qty)} className={`hover-glow-green ${styles.cartBtn}`}>
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>

          {/* Stock Info */}
          <div className={styles.stockRow}>
            <span>Status:</span>
            <span className={product.p_qty > 0 ? styles.inStock : styles.outOfStock}>
              {product.p_qty > 0 ? `In Stock (${product.p_qty} units)` : 'Out of Stock'}
            </span>
          </div>

          {/* Values */}
          <div className={styles.valueProps}>
            <div className={styles.valueItem}>
              <ShieldCheck size={18} className={styles.valueIcon} />
              <span>Certified 100% Organic & Non-Toxic</span>
            </div>
            <div className={styles.valueItem}>
              <RefreshCw size={18} className={styles.valueIcon} />
              <span>30-Day Money Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs description / features */}
      <section className={styles.tabsSection}>
        <div className={styles.tabsHeader}>
          <button 
            onClick={() => setActiveTab('description')} 
            className={`${styles.tabLink} ${activeTab === 'description' ? styles.tabActive : ''}`}
          >
            Product Overview
          </button>
          <button 
            onClick={() => setActiveTab('features')} 
            className={`${styles.tabLink} ${activeTab === 'features' ? styles.tabActive : ''}`}
          >
            Specifications & Features
          </button>
        </div>

        <div className={`glass ${styles.tabContent}`}>
          {activeTab === 'description' && (
            <div dangerouslySetInnerHTML={{ __html: product.p_description }} className={styles.overviewText} />
          )}
          {activeTab === 'features' && (
            <ul className={styles.featuresList}>
              {product.p_feature.split(',').map((f, i) => (
                <li key={i}>{f.trim()}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className={styles.reviewsSection}>
        <h3>Customer Reviews ({product.ratings ? product.ratings.length : 0})</h3>
        <div className={styles.reviewsList}>
          {product.ratings && product.ratings.length > 0 ? (
            product.ratings.map((r, i) => (
              <div key={i} className={`glass ${styles.reviewCard}`}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerName}>{r.cust_name}</div>
                  <div className={styles.stars}>{renderStars(r.rating)}</div>
                </div>
                <p className={styles.reviewComment}>{r.comment}</p>
              </div>
            ))
          ) : (
            <p className={styles.noReviews}>No customer reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </section>
    </div>
  );
}
