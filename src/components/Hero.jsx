'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sliders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Map DB keys to component keys
          const formatted = data.map(row => ({
            id: row.id,
            heading: row.heading,
            content: row.content,
            buttonText: row.button_text,
            buttonUrl: row.button_url || '/',
            bgImage: row.photo.includes('/') ? row.photo : `/assets/uploads/${row.photo}`,
            position: row.position
          }));
          setSlides(formatted);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return <div className={styles.heroContainer} style={{ background: '#081214' }} />;
  }

  if (slides.length === 0) {
    return null; // Fallback if no sliders in DB
  }

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[current];

  // Map "Left", "Right", "Center" position string from DB to align-items
  let alignItems = 'center';
  let textAlign = 'center';
  if (slide.position === 'Left') { alignItems = 'flex-start'; textAlign = 'left'; }
  if (slide.position === 'Right') { alignItems = 'flex-end'; textAlign = 'right'; }

  return (
    <div 
      className={styles.heroContainer} 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${slide.bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div 
        className={`container ${styles.slideContent}`} 
        style={{ display: 'flex', flexDirection: 'column', alignItems, textAlign, width: '100%' }}
      >
        <h1 className="animate-fade-in">{slide.heading}</h1>
        <p className="animate-fade-in" style={{ whiteSpace: 'pre-wrap' }}>{slide.content}</p>
        <div className={styles.btnWrapper} style={{ justifyContent: alignItems === 'center' ? 'center' : 'flex-start' }}>
          {slide.buttonText && (
            <Link href={slide.buttonUrl} className={`hover-glow-green ${styles.ctaBtn}`}>
              {slide.buttonText}
            </Link>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={handlePrev} className={styles.navBtnLeft} aria-label="Previous slide">
            <ChevronLeft size={24} />
          </button>
          <button onClick={handleNext} className={styles.navBtnRight} aria-label="Next slide">
            <ChevronRight size={24} />
          </button>

          <div className={styles.indicators}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`${styles.indicator} ${index === current ? styles.active : ''}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
