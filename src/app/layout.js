import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

export const metadata = {
  title: "ValamAgri | Premium Organic Fertilizers & Pesticides",
  description: "OMRI listed certified organic fertilizers and biological pest controls for healthy crops and sustainable soils.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 180px)' }}>
            {children}
          </main>
          {/* Footer */}
          <footer style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--glass-border)',
            padding: '30px 0',
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--text-muted)'
          }}>
            <div className="container">
              <p>&copy; {new Date().getFullYear()} ValamAgri Organic Store. All rights reserved.</p>
              <p style={{ marginTop: '6px', fontSize: '12px' }}>Certified OMRI Organic & Environmentally Sustainable Solutions.</p>
            </div>
          </footer>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
