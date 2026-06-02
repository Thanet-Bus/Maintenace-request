import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './Technicians.module.css';
import { API_BASE_URL } from '../../config';
import JobCard from '../../components/JobCard';
import type { RepairRequest, AssignmentResponse } from '../../types/types';

type Technician = {
  id: number;
  username: string;
  name: string;
  phone?: string | null;
  profile_image_url?: string | null;
  activeJobsCount?: number;
};

const Technicians: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  // History Modal State
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [techRequests, setTechRequests] = useState<RepairRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTechnicians = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/users/technicians`);
    if (!res.ok) throw new Error("Failed to fetch technicians");
    const data = await res.json();
    
    // Fetch active assignments count for each technician
    const techsWithStats = await Promise.all(data.map(async (tech: Technician) => {
      try {
        const asRes = await fetch(`${API_BASE_URL}/assignments/technician/${tech.id}`);
        if (asRes.ok) {
           const assignments = await asRes.json();
           return { ...tech, activeJobsCount: assignments.length };
        }
      } catch (err) {
         console.error(`Failed to fetch stats for tech ${tech.id} ${err}`);
      }
      return { ...tech, activeJobsCount: 0 };
    }));
    
    setTechnicians(techsWithStats);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        await Promise.all([
          fetchTechnicians(),
        ]);
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading page data", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [fetchTechnicians]);

  const handleViewHistory = useCallback(async (tech: Technician) => {
    setSelectedTech(tech);
    setIsModalOpen(true);
    setHistoryLoading(true);
    setTechRequests([]);

    try {
      // 1. Get assignments for this technician
      const res = await fetch(`${API_BASE_URL}/assignments/technician/${tech.id}`);
      if (!res.ok) throw new Error("Failed to fetch assignments");
      const assignments: AssignmentResponse[] = await res.json(); 

      // 2. Fetch full details for each unique request
      const requestIds = assignments.map((a: AssignmentResponse) => a.repair_request_id);
      const uniqueIds = Array.from(new Set(requestIds));

      const requestDetails = await Promise.all(
        uniqueIds.map(async (id) => {
          const rRes = await fetch(`${API_BASE_URL}/repair-requests/${id}`);
          if (rRes.ok) return rRes.json();
          return null;
        })
      );

      setTechRequests(requestDetails.filter(r => r !== null));
    } catch (err) {
      console.error("Error loading technician history", err);
    } finally {
      setHistoryLoading(false);
    }
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
                    <span className={styles.statValue}>{tech.activeJobsCount ?? 0}</span>
                    <span className={styles.statLabel}>งานที่รับผิดชอบ</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>4.8</span>
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
