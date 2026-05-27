import React from 'react';
import TopAppBar from './TopAppBar';
import BottomNavBar from './BottomNavBar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'ระบบแจ้งซ่อม', showBackButton, showBottomNav = true }) => {
  return (
    <div className={styles.layoutWrapper}>
      <TopAppBar title={title} showBackButton={showBackButton} />
      <main className={styles.main}>
        {children}
      </main>
      {showBottomNav && <BottomNavBar />}
    </div>
  );
};

export default Layout;
