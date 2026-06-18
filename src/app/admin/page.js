'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Landmark, Users, Package, DollarSign, Plus, Edit, Trash, X, Lock } from 'lucide-react';
import Link from 'next/link';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useCart();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pId, setPId] = useState(null);
  const [name, setName] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [qty, setQty] = useState('');
  const [ecatId, setEcatId] = useState('1'); 
  const [description, setDescription] = useState('');
  const [feature, setFeature] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!user || (user.cust_email !== 'admin@mail.com' && user.role !== 'Super Admin' && user.role !== 'Admin')) {
      setLoading(false);
      return;
    }

    const fetchStats = fetch('/api/admin/stats').then(res => res.json());
    const fetchProducts = fetch('/api/products').then(res => res.json());
    const fetchCats = fetch('/api/categories').then(res => res.json());

    Promise.all([fetchStats, fetchProducts, fetchCats])
      .then(([statsData, productsData, catsData]) => {
        if (!statsData.error) setStats(statsData);
        if (Array.isArray(productsData)) setProducts(productsData);
        if (Array.isArray(catsData)) setCategories(catsData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading Admin Panel...
      </div>
    );
  }

  if (!user || (user.cust_email !== 'admin@mail.com' && user.role !== 'Super Admin' && user.role !== 'Admin')) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '40px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
          <Lock size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h3>Access Denied</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px 0', fontSize: '14px' }}>
            You must be logged in as an Administrator to view this page.
          </p>
          <Link href="/login" style={{ background: 'var(--accent-green)', padding: '10px 24px', borderRadius: '30px', display: 'inline-block', color: '#fff' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      old_price: oldPrice,
      current_price: currentPrice,
      qty: parseInt(qty),
      ecat_id: parseInt(ecatId),
      description,
      short_description: shortDescription,
      feature
    };

    let url = '/api/admin/products';
    let method = 'POST';

    if (editMode) {
      payload.id = pId;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) setProducts(prodData);
        resetForm();
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
  };

  const handleEditClick = (p) => {
    setEditMode(true);
    setPId(p.p_id);
    setName(p.p_name);
    setOldPrice(p.p_old_price);
    setCurrentPrice(p.p_current_price);
    setQty(p.p_qty.toString());
    setEcatId(p.ecat_id.toString());
    setDescription(p.p_description);
    setShortDescription(p.p_short_description);
    setFeature(p.p_feature);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.p_id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setPId(null);
    setName('');
    setOldPrice('');
    setCurrentPrice('');
    setQty('');
    setEcatId('1');
    setDescription('');
    setShortDescription('');
    setFeature('');
    setShowForm(false);
    setError('');
  };

  return (
    <div className={`container ${styles.adminPage}`}>
      <div className={styles.adminHeader}>
        <h1>Admin Control Center</h1>
        <p>Manage products, monitor sales statistics, and track logistics</p>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={`glass ${styles.statCard}`}>
            <DollarSign size={24} className={styles.statIcon} style={{ color: 'var(--accent-green)' }} />
            <div>
              <div className={styles.statLabel}>Total Sales</div>
              <div className={styles.statVal}>${parseFloat(stats.sales).toFixed(2)}</div>
            </div>
          </div>
          <div className={`glass ${styles.statCard}`}>
            <Landmark size={24} className={styles.statIcon} style={{ color: 'var(--accent-gold)' }} />
            <div>
              <div className={styles.statLabel}>Orders Placed</div>
              <div className={styles.statVal}>{stats.orders}</div>
            </div>
          </div>
          <div className={`glass ${styles.statCard}`}>
            <Users size={24} className={styles.statIcon} style={{ color: '#00b4d8' }} />
            <div>
              <div className={styles.statLabel}>Growers Registered</div>
              <div className={styles.statVal}>{stats.customers}</div>
            </div>
          </div>
          <div className={`glass ${styles.statCard}`}>
            <Package size={24} className={styles.statIcon} style={{ color: '#b5179e' }} />
            <div>
              <div className={styles.statLabel}>Products Listed</div>
              <div className={styles.statVal}>{stats.products}</div>
            </div>
          </div>
        </div>
      )}

      <section className={styles.managerSection}>
        <div className={styles.managerHeader}>
          <h2>Product Inventory</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className={styles.addBtn}>
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>

        {showForm && (
          <div className={`glass ${styles.formCard}`}>
            <div className={styles.formHeader}>
              <h3>{editMode ? 'Edit Product Details' : 'Add New Organic Product'}</h3>
              <button onClick={resetForm} className={styles.closeBtn}><X size={18} /></button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Product Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Subcategory</label>
                  <select value={ecatId} onChange={(e) => setEcatId(e.target.value)} required>
                    {categories.map(top => (
                      <optgroup key={top.tcat_id} label={top.tcat_name}>
                        {top.mid_categories.map(mid => (
                          mid.end_categories.map(end => (
                            <option key={end.ecat_id} value={end.ecat_id}>
                              {mid.mcat_name} &gt; {end.ecat_name}
                            </option>
                          ))
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRowThree}>
                <div className={styles.inputGroup}>
                  <label>Current Price ($)</label>
                  <input type="number" step="0.01" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Old Price (Optional) ($)</label>
                  <input type="number" step="0.01" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Stock Qty</label>
                  <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} required />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Short Slogan / Hook</label>
                <input type="text" placeholder="100% pure cold-pressed Neem oil..." value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
              </div>

              <div className={styles.inputGroup}>
                <label>Core Features (comma separated list)</label>
                <input type="text" placeholder="Organic, Cold-Pressed, Concentrated" value={feature} onChange={(e) => setFeature(e.target.value)} required />
              </div>

              <div className={styles.inputGroup}>
                <label>Detailed Overview Description</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>

              <div className={styles.formButtons}>
                <button type="button" onClick={resetForm} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>
                  {editMode ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.productsTableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th className={styles.textCenter}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.p_id}>
                  <td>
                    <div className={styles.tableProductCell}>
                      <img src={`/assets/uploads/${p.p_featured_photo}`} alt="" className={styles.tableProductImg} />
                      <span className={styles.tableProductName}>{p.p_name}</span>
                    </div>
                  </td>
                  <td className={styles.tableProductPrice}>${parseFloat(p.p_current_price).toFixed(2)}</td>
                  <td>
                    <span className={p.p_qty > 20 ? styles.tableInStock : styles.tableLowStock}>
                      {p.p_qty} units
                    </span>
                  </td>
                  <td className={styles.tableProductCategory}>{p.ecat_name}</td>
                  <td>
                    <div className={styles.tableActions}>
                      <button onClick={() => handleEditClick(p)} className={styles.editBtn} title="Edit Product"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteClick(p.p_id)} className={styles.deleteBtn} title="Delete Product"><Trash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
