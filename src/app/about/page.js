import { query } from '@/lib/db';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const result = await query('SELECT * FROM tbl_page WHERE id=1');
  const pageData = result[0];

  return (
    <div className={styles.home}>
      {/* Banner */}
      <div 
        style={{ 
          backgroundImage: `url('/assets/uploads/${pageData?.about_banner}')`,
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
          {pageData?.about_title || 'About Us'}
        </h1>
      </div>

      <div className="container" style={{ padding: '60px 0' }}>
        <div 
          className="prose"
          style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: pageData?.about_content || '<p>Content coming soon.</p>' }} 
        />
      </div>
    </div>
  );
}
