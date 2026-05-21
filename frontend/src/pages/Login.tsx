import React from 'react';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const handleLogin = () => {
    // Navigate to dashboard for demo purposes
    window.location.href = '/dashboard';
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        <div className={styles.loginCard}>
          {/* Icon/Logo Area */}
          <div className={styles.logoContainer}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--color-primary)' }}>
              build_circle
            </span>
          </div>

          {/* App Name */}
          <h1 className={styles.title}>
            ระบบแจ้งซ่อมบำรุง<br />
            <span className={styles.subtitle}>(Maintenance Request System)</span>
          </h1>

          {/* Description */}
          <p className={styles.description}>
            เข้าสู่ระบบด้วย LINE เพื่อแจ้งซ่อมและติดตามสถานะงานของคุณ
          </p>

          {/* Login Button */}
          <button className={styles.lineButton} onClick={handleLogin}>
            <svg aria-hidden="true" className={styles.lineIcon} viewBox="0 0 24 24">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.96 8.91 9.385 9.605.367.078.868.243.996.559.116.287.075.738.035.952-.05.27-1.127 3.328-1.343 4.02-.239.771 1.258.552 1.636.377.925-.436 4.966-2.923 6.815-5.029C21.688 17.653 24 14.28 24 10.304z" />
            </svg>
            <span className={styles.buttonText}>เข้าสู่ระบบด้วย LINE</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className={styles.footerNote}>
          <p>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>
              lock
            </span>
            เราใช้ข้อมูลโปรไฟล์ LINE ของคุณเพื่อระบุตัวตนในการแจ้งซ่อมเท่านั้น
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
