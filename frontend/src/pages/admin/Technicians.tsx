import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './Technicians.module.css';
import JobCard from '../../components/JobCard';
import { useTechnicians } from '../../hooks/admin/useTechnicians';

const Technicians: React.FC = () => {
  const {
    technicians,
    loading,
    selectedTech,
    techRequests,
    historyLoading,
    isModalOpen, setIsModalOpen,
    handleViewHistory
  } = useTechnicians();

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
                    <span className={styles.statValue}>{tech.activeJobsCount ?? 0}</span>
                    <span className={styles.statLabel}>งานที่รับผิดชอบ</span>
                  </div>
                   <div className={styles.stat}>
                     <span className={styles.statValue}>{(tech).avgRating?.toFixed(1) || '-'}</span>
                     <span className={styles.statLabel}>คะแนน</span>
                   </div>
                </div>

                <div className={styles.actions}>
                  <button className={styles.viewBtn} onClick={() => handleViewHistory(tech)}>ดูประวัติ</button>
                  <button className={styles.editBtn}>แก้ไข</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technician History Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={`material-symbols-outlined ${styles.modalIcon}`}>engineering</span>
              <h3 className={styles.modalTitle}>ประวัติงาน: {selectedTech?.name}</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {historyLoading ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลดประวัติงาน...</p>
              ) : techRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-outline-variant)' }}>folder_off</span>
                    <p style={{ marginTop: '1rem', color: 'var(--color-on-surface-variant)' }}>ไม่พบประวัติการได้รับมอบหมายงาน</p>
                </div>
              ) : (
                <div className={styles.historyList}>
                  {techRequests.map((request) => (
                    <JobCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Technicians;
