'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingCart } from 'lucide-react';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const savings = product.p_old_price 
    ? Math.round(((parseFloat(product.p_old_price) - parseFloat(product.p_current_price)) / parseFloat(product.p_old_price)) * 100)
    : 0;

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} size={14} className={styles.starFilled} />);
      } else if (i === floor + 1 && rating % 1 >= 0.5) {
        stars.push(<Star key={i} size={14} className={styles.starHalf} />);
      } else {
        stars.push(<Star key={i} size={14} className={styles.starEmpty} />);
      }
    }
    return stars;
  };

  const handleCardClick = () => {
    router.push(`/product/${product.p_id}`);
  };

  return (
    <div className={`glass hover-glow-green ${styles.card}`} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {savings > 0 && (
        <span className={styles.savingsBadge}>-{savings}% OFF</span>
      )}

      <div className={styles.imageWrapper}>
        <img 
          src={`/assets/uploads/${product.p_featured_photo}`} 
          alt={product.p_name} 
          className={styles.image}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.categoryName}>OMRI LISTED ORGANIC</div>
        <Link href={`/product/${product.p_id}`} className={styles.title} onClick={(e) => e.stopPropagation()}>
          {product.p_name}
        </Link>

        <div className={styles.ratingRow}>
          <div className={styles.stars}>{renderStars(product.avg_rating)}</div>
          {product.avg_rating > 0 && (
            <span className={styles.ratingText}>({product.avg_rating.toFixed(1)})</span>
          )}
        </div>

        <div className={styles.footerRow}>
          <div className={styles.priceContainer}>
            <span className={styles.price}>${parseFloat(product.p_current_price).toFixed(2)}</span>
            {product.p_old_price && (
              <span className={styles.oldPrice}>${parseFloat(product.p_old_price).toFixed(2)}</span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }} 
            className={styles.addToCartBtn}
            title="Add to Cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
