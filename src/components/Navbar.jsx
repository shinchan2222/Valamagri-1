'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingBag, User, LogOut, ChevronDown, Leaf, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const { cartCount, setIsOpen, user, logoutUser } = useCart();
  const [categories, setCategories] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim() !== '') {
      router.push(`/?search=${encodeURIComponent(searchVal.trim())}`);
      setIsMenuOpen(false);
    } else {
      router.push('/');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`glass ${styles.navbar}`}>
      <div className={`container ${styles.navContainer}`}>
        
        {/* Mobile Menu Toggle */}
        <button 
          className={styles.mobileMenuBtn} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
          <Leaf className={styles.logoIcon} />
          <span>ValamAgri</span>
        </Link>

        {/* Desktop Nav Links & Search Container */}
        <div className={`${styles.navLinksContainer} ${isMenuOpen ? styles.mobileOpen : ''}`}>
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search organic fertilizers & pesticides..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <Search size={18} />
            </button>
          </form>

          {/* Nav Links */}
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Home</Link>

            {/* Categories Dropdown */}
            <div 
              className={styles.dropdownContainer}
              onMouseEnter={() => setIsCatDropdownOpen(true)}
              onMouseLeave={() => setIsCatDropdownOpen(false)}
            >
              <button className={styles.navLinkDropdown}>
                Shop <ChevronDown size={14} />
              </button>
              
              {isCatDropdownOpen && (
                <div className={`glass ${styles.dropdownMenu}`}>
                  {categories.map(top => (
                    <div key={top.tcat_id} className={styles.dropdownGroup}>
                      <Link href={`/?tcat=${top.tcat_id}`} className={styles.dropdownTitle} onClick={() => setIsMenuOpen(false)}>
                        {top.tcat_name}
                      </Link>
                      <div className={styles.dropdownSubItems}>
                        {top.mid_categories.map(mid => (
                          <Link key={mid.mcat_name} href={`/?mcat=${mid.mcat_id}`} className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                            {mid.mcat_name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link href="/faq" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>FAQ</Link>
          </div>
        </div>

        {/* User & Cart Controls */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.userSection}>
              <Link href="/dashboard" className={styles.userDashboardLink} onClick={() => setIsMenuOpen(false)}>
                <User size={18} />
                <span className={styles.userName}>{user.cust_name.split(' ')[0]}</span>
              </Link>
              <button onClick={logoutUser} className={styles.actionBtn} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.actionBtn} title="Login / Register" onClick={() => setIsMenuOpen(false)}>
              <User size={18} />
            </Link>
          )}

          <button onClick={() => setIsOpen(true)} className={styles.cartBtn} title="Shopping Cart">
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
