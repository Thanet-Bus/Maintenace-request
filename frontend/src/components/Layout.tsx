import React from 'react';
import TopAppBar from './TopAppBar';
import BottomNavBar from './BottomNavBar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'ระบบแจ้งซ่อม' }) => {
  return (
    <div className={styles.layoutWrapper}>
      <TopAppBar title={title} />
      <main className={styles.main}>
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default Layout;
