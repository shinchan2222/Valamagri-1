import { query } from '@/lib/db';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export default async function FAQPage() {
  const result = await query('SELECT * FROM tbl_page WHERE id=1');
  const pageData = result[0];
  
  const faqs = await query('SELECT * FROM tbl_faq');

  return (
    <div className={styles.home}>
      {/* Banner */}
      <div 
        style={{ 
          backgroundImage: `url('/assets/uploads/${pageData?.faq_banner}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
        <h1 style={{ color: '#fff', fontSize: '42px', zIndex: 10, position: 'relative' }}>
          {pageData?.faq_title || 'Frequently Asked Questions'}
        </h1>
      </div>

      <div className="container" style={{ padding: '60px 0', maxWidth: '800px' }}>
        {faqs.map(faq => (
          <div key={faq.faq_id} style={{ marginBottom: '30px', padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>
              {faq.faq_title}
            </h3>
            <div 
              style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: faq.faq_content }} 
            />
          </div>
        ))}
        {faqs.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No FAQs available at the moment.</p>
        )}
      </div>
    </div>
  );
}
