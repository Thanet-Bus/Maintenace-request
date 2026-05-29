import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminLogin.module.css';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to admin dashboard (placeholder)
    navigate('/admin/requests');
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.loginCard}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.iconContainer}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', fontVariationSettings: '"FILL" 1' }}>
              admin_panel_settings
            </span>
          </div>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>เข้าสู่ระบบสำหรับผู้ดูแลระบบ</h1>
            <p className={styles.subtitle}>Maintenance Pro - Facility Management</p>
          </div>
        </header>

        {/* Form Section */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Username Input Group */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="username">ชื่อผู้ใช้งาน</label>
            <div className={styles.inputWithIcon}>
              <span className={`material-symbols-outlined ${styles.prefixIcon}`}>person</span>
              <input 
                className={styles.input} 
                id="username" 
                name="username" 
                placeholder="กรอกชื่อผู้ใช้งาน" 
                required 
                type="text" 
              />
            </div>
          </div>

          {/* Password Input Group */}
          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">รหัสผ่าน</label>
              <a className={styles.forgotLink} href="#">ลืมรหัสผ่าน?</a>
            </div>
            <div className={styles.inputWithIcon}>
              <span className={`material-symbols-outlined ${styles.prefixIcon}`}>lock</span>
              <input 
                className={styles.input} 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type="password" 
                style={{ paddingRight: '44px' }}
              />
              <button className={styles.visibilityButton} type="button">
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button className={styles.submitButton} type="submit">
            เข้าสู่ระบบ
          </button>
        </form>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.footerText}>
            พบปัญหาในการเข้าใช้งาน? <a className={styles.supportLink} href="#">ติดต่อฝ่ายสนับสนุน</a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AdminLogin;
