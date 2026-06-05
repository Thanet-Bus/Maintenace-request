import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      {/* Navigation Drawer */}
      <nav className={styles.drawer}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            <img 
              alt="Admin Avatar" 
              className={styles.avatar} 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFOlrMCaAPL36ugz7hNsMB3rsQ_HCDOgr8cvPNchIVuOsTN4IhxMa-A8VvSKPOJ-c5jHCSM8QYXR7BTk1xoD7PqfmUOaLBk9SVjbLRWJEXJdgMYajyRLgW2UEZ4nKtCiXxTX9yfN9aTxJRL2TXLL-LFh36rOedT2EKVVuEqVLkMreGV1UC-Yy_oSKW_jPvOzaLSPfQRW5r4zc0pth9B5wPn4iCFqNDNTmdLeShWzsA9uOHGqVfptib57-07VLOkb8RcGdxtwbHjFmf" 
            />
          </div>
          <div className={styles.profileText}>
            <span className={styles.consoleTitle}>Admin Console</span>
            <span className={styles.subTitle}>Facility Management</span>
          </div>
        </div>

        <div className={styles.navItems}>
          <NavLink to="/admin/requests" className={({ isActive }) => isActive ? styles.activeItem : styles.item}>
            <span className="material-symbols-outlined">list_alt</span>
            All Requests
          </NavLink>
          <NavLink to="/admin/technicians" className={({ isActive }) => isActive ? styles.activeItem : styles.item}>
            <span className="material-symbols-outlined">group</span>
            Technicians
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => isActive ? styles.activeItem : styles.item}>
            <span className="material-symbols-outlined">analytics</span>
            Reports
          </NavLink>
          
          <div className={styles.spacer}></div>
          
        </div>
      </nav>

      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.appBrand}>Maintenance Pro</span>
          </div>
        </header>
        
        <main className={styles.contentCanvas}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
