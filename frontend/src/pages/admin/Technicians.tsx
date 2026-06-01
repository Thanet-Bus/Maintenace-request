import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './Technicians.module.css';
import { API_BASE_URL } from '../../config';

type Technician = {
  id: number;
  username: string;
  name: string;
  phone?: string | null;
  profile_image_url?: string | null;
};

const Technicians: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/users/technicians`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch technicians");
        return res.json();
      })
      .then(data => {
        setTechnicians(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>รายชื่อช่างเทคนิค</h1>
            <p className={styles.pageSubtitle}>Manage and monitor your maintenance team.</p>
          </div>
          <button className={styles.addBtn}>
            <span className="material-symbols-outlined">person_add</span>
            เพิ่มช่างใหม่
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '3rem' }}>กำลังโหลดข้อมูล...</p>
        ) : technicians.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '3rem' }}>ไม่พบรายชื่อช่างเทคนิค</p>
        ) : (
          <div className={styles.techGrid}>
            {technicians.map((tech) => (
              <div key={tech.id} className={styles.techCard}>
                <div className={styles.cardHeader}>
                  {tech.profile_image_url ? (
                    <img src={tech.profile_image_url} alt={tech.name} className={styles.avatar} />
                  ) : (
                    <div className={styles.initialAvatar}>{tech.name.charAt(0)}</div>
                  )}
                  <div className={styles.nameInfo}>
                    <h3 className={styles.techName}>{tech.name}</h3>
                    <span className={styles.roleTag}>ช่างเทคนิค</span>
                  </div>
                </div>

                <div className={styles.contactInfo}>
                  <div className={styles.infoItem}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>phone</span>
                    <span>{tech.phone || 'ไม่ระบุเบอร์โทรศัพท์'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>badge</span>
                    <span>@{tech.username}</span>
                  </div>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>12</span>
                    <span className={styles.statLabel}>งานเสร็จสิ้น</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>2</span>
                    <span className={styles.statLabel}>กำลังทำ</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>4.8</span>
                    <span className={styles.statLabel}>คะแนน</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button className={styles.viewBtn}>ดูประวัติ</button>
                  <button className={styles.editBtn}>แก้ไข</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Technicians;
