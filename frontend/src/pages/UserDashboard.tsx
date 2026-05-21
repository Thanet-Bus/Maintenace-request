import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import styles from './UserDashboard.module.css';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout title="ระบบแจ้งซ่อม">
      <div className={styles.container}>
        {/* User Profile Card */}
        <section className={styles.profileCard}>
          <img 
            alt="User Profile" 
            className={styles.profileImage}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCilI4NljP5DignL-ar7WIqo2cCvYJhMe8_6DD6X8zUy4ypdyyoksNjAiYPP2Aq3IDh4ijuTki9w0XMYjHKHMXnKwjTx3Pb7exJ0F8VnyCSv9EsdP-0K4RJnD7Loj641hK-Gupxl7lmWfJt9LaU6VEifbkCkODmF4MAgM50QudMdbM7NZMkpWU7F-m7KrreA8a4DMXDqvOzASDfMyNmaxXq9KuOFgF-6HpIVNpwaSX3G4VP_b840to3BqqarO0JxiR6t6_lVYOQuTXc" 
          />
          <div className={styles.profileInfo}>
            <h2 className={styles.userName}>คุณสมชาย ใจดี</h2>
            <p className={styles.userId}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>badge</span>
              ID: smch_2024
            </p>
          </div>
        </section>

        {/* Main Action Button */}
        <button className={styles.newRequestButton} onClick={() => navigate('/create-request')}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>add_circle</span>
          <span>แจ้งซ่อมใหม่</span>
        </button>

        {/* Summary Cards Grid */}
        <section className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCount} style={{ color: 'var(--color-secondary)' }}>12</span>
            <span className={styles.summaryLabel}>งานทั้งหมด</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCount} style={{ color: 'var(--color-tertiary-container)' }}>2</span>
            <span className={styles.summaryLabel}>รอดำเนินการ</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCount} style={{ color: 'var(--color-primary)' }}>1</span>
            <span className={styles.summaryLabel}>กำลังซ่อม</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCount} style={{ color: 'var(--color-outline)' }}>9</span>
            <span className={styles.summaryLabel}>เสร็จสิ้น</span>
          </div>
        </section>

        {/* Request List Section */}
        <section className={styles.requestSection}>
          <h3 className={styles.sectionTitle}>รายการแจ้งซ่อมของคุณ</h3>
          
          {/* Individual Job Card */}
          <div className={styles.jobCard}>
            <div className={styles.jobHeader}>
              <span className={styles.jobId}>#REQ-1002</span>
              <span className={styles.statusBadge}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>build</span>
                กำลังซ่อม
              </span>
            </div>
            
            <h4 className={styles.jobTitle}>ก๊อกน้ำรั่วในห้องน้ำชั้น 2</h4>
            
            <div className={styles.jobDetails}>
              <div className={styles.detailItem}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>location_on</span>
                <span>ตึก A ห้อง 204</span>
              </div>
              <div className={styles.detailItem}>
                <span className="material-symbols-outlined">priority_high</span>
                <span>ความสำคัญ: ปกติ</span>
              </div>
              <div className={styles.detailItem}>
                <span className="material-symbols-outlined">event</span>
                <span>แจ้งเมื่อ: 12 พ.ค. 2567</span>
              </div>
            </div>

            <div className={styles.appointmentBox}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>calendar_clock</span>
              <div>
                <p className={styles.appointmentLabel}>เวลานัดหมายเข้าซ่อม</p>
                <p className={styles.appointmentTime}>13 พ.ค. 2567, 10:00 น.</p>
              </div>
            </div>

            {/* Real-time Status Tracking Bar */}
            <div className={styles.trackingContainer}>
              <div className={styles.trackingLine}>
                <div className={styles.trackingProgress} style={{ width: '50%' }}></div>
              </div>
              <div className={styles.trackingSteps}>
                <div className={styles.step}>
                  <div className={`${styles.stepDot} ${styles.stepActive}`}></div>
                  <span className={styles.stepLabel} style={{ color: 'var(--color-primary)' }}>รับเรื่อง</span>
                </div>
                <div className={styles.step}>
                  <div className={`${styles.stepDot} ${styles.stepActive} ${styles.stepCurrent}`}></div>
                  <span className={styles.stepLabel} style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>กำลังซ่อม</span>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepDot}></div>
                  <span className={styles.stepLabel}>เสร็จสิ้น</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default UserDashboard;
