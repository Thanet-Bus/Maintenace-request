import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import OnHoldReport from '../components/OnHoldReport';
import type { RepairRequest, RepairLog, AssignmentResponse, AssignmentDetail } from '../types/types';
import styles from './JobDetail.module.css';
import { API_BASE_URL } from "../config";

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  
  const [requestLoading, setRequestLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnHoldReportOpen, setIsOnHoldReportOpen] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`${API_BASE_URL}/repair-requests/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch request");
    }
    const data = await res.json();
    setRequest(data);
  }, [id]);

  const fetchLogs = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`${API_BASE_URL}/logs/request/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch logs");
    }
    const data = await res.json();
    setLogs(data);
  }, [id]);

  const fetchAssignments = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`${API_BASE_URL}/assignments/repair-request/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch assignments");
    }
    const data: AssignmentResponse = await res.json();
    setAssignments(data.technicians);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadInitialData() {
      try {
        await Promise.all([
          fetchRequestDetails(),
          fetchLogs(),
          fetchAssignments(),
        ]);
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading page data", err);
        }
      } finally {
        if (!cancelled) {
          setRequestLoading(false);
          setLogsLoading(false);
          setAssignmentsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [id, fetchRequestDetails, fetchLogs, fetchAssignments]);

  const handleOnHoldConfirm = async (reason: string, notes: string) => {
    if (!id) return;

    const fullNote = `พักงาน: ${reason}${notes ? ` - ${notes}` : ''}`;
    
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE_URL}/repair-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ON_HOLD',
          note: fullNote,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status to ON_HOLD');
      }

      await Promise.all([
        fetchRequestDetails(),
        fetchLogs(),
      ]);
    } catch (error) {
      console.error('Error confirming on hold:', error);
      throw error;
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'รอดำเนินการ', color: 'var(--color-tertiary-container)' };
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return { label: 'กำลังซ่อม', color: 'var(--color-primary)' };
      case 'COMPLETED':
        return { label: 'เสร็จสิ้น', color: 'var(--color-outline)' };
      case 'ON_HOLD':
        return { label: 'พักงาน', color: 'var(--color-error)' };
      case 'CANCELLED':
        return { label: 'ยกเลิก', color: 'var(--color-error)' };
      default:
        return { label: status, color: 'var(--color-on-surface-variant)' };
    }
  };

  if (requestLoading) {
    return (
      <Layout title="รายละเอียดงาน">
        <div className={styles.container}>
          <p style={{ textAlign: 'center', marginTop: '40px' }}>กำลังโหลดข้อมูล...</p>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout title="รายละเอียดงาน">
        <div className={styles.container}>
          <p style={{ textAlign: 'center', marginTop: '40px' }}>ไม่พบข้อมูลงานที่ระบุ</p>
          <button 
            className={styles.primaryButton} 
            onClick={() => navigate('/tasks')}
          >
            กลับไปหน้ารวมงาน
          </button>
        </div>
      </Layout>
    );
  }

  const badge = getStatusBadge(request.status);

  return (
    <Layout title="Maintenance Pro" showBackButton showBottomNav={false}>
      <div className={`${styles.container} ${refreshing ? styles.refreshingContent : ''}`}>
        {refreshing && (
          <div className={styles.refreshOverlay}>
            <span className="material-symbols-outlined animate-spin">sync</span>
            <span>กำลังอัปเดต...</span>
          </div>
        )}
        {/* Job Header & Status */}

        <section className={styles.section}>
          <div className={styles.jobHeader}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span className={styles.jobId}>#REQ-{request.id.toString().padStart(4, '0')}</span>
              <h2 className={styles.jobTitle}>{request.title}</h2>
            </div>
            <div 
              className={styles.statusBadge} 
              style={{ color: badge.color, backgroundColor: `color-mix(in srgb, ${badge.color} 10%, transparent)` }}
            >
              {badge.label}
            </div>
          </div>
          
          <div className={styles.detailsBox}>
            <div className={styles.detailItem}>
              <span className="material-symbols-outlined text-outline">location_on</span>
              <span>สถานที่: {request.location}</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.requesterBox}>
              <div className={styles.avatar}>
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9X0kH8DY9cT8ZRH8rm0kww-0Fkj10u_ytZaEhfg_xy-PdO3yeSirWrUUG_p5W-PsIiQPn4zIw3QSLmVIYebRrq0wIq-SYZfIpiUo3LFLwB0e7sZgFERGbGXNWIw_2QuA5gTiklg52v_cTpyuqBhGRqwD8KqLBOIvRD1zP2edEuDxI4MWRloIdWDgUR_LD6srgXKtcZ71SfZh4smalvP7HfNBUqlflCtSf-ZnSCrN_uFpLj9Ax3VCyzEzy7bQPeBid8CDL9dDaeROv" alt="Requester" />
              </div>
              <div className={styles.requesterInfo}>
                <span className={styles.requesterLabel}>ผู้แจ้ง (Requester)</span>
                <span className={styles.requesterName}>คุณวิภาดา</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Photos */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>รูปภาพก่อนซ่อม (Problem Photos)</h3>
          <div className={styles.photoGrid}>
            <div className={styles.photoItem}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtdHn5H-xTgXlx8rRrzNkMcLG3-aJmOaaxydteshhAIwFM0W7uqDQ5sb5TfsWGW_4iPmBRblwSScOOO43mh_aqd3rmq1TSIgxVJNhdH-d9UcVTRdJLaomKHhtYUFIR6nUzH3pr4RU-wSK_rSSmhx8E5hTVQbCakaQkV6AHrVvAvjddjRq8KdN3ssY6z2_wL_k8MQ5HIv2c9nzWDZFGT7HrzF05dk3gVqL4_aYF5EGKubvQwDFqHjaVlt7HpLKpFL1jX5st-vd1RkkA" alt="Problem" />
            </div>
            <button className={styles.addPhotoButton}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add_photo_alternate</span>
              <span style={{ fontSize: '12px', fontWeight: '600' }}>เพิ่มรูปภาพ</span>
            </button>
          </div>
        </section>

        {/* Assigned Team */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>ทีมช่างที่ได้รับมอบหมาย (Assigned Team)</h3>
          {assignmentsLoading ? (
            <p style={{ fontSize: '14px', textAlign: 'center' }}>กำลังโหลดข้อมูลทีมช่าง...</p>
          ) : assignments.length === 0 ? (
            <p style={{ fontSize: '14px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>ยังไม่มีการมอบหมายทีมช่าง</p>
          ) : (
            <ul className={styles.teamList}>
              {assignments.map((assignment) => (
                <li 
                  key={assignment.technician_id} 
                  className={`${styles.teamMember} ${assignment.is_leader ? styles.leadMember : styles.regularMember}`}
                >
                  <div className={styles.memberAvatar}>
                    <img 
                      src={assignment.is_leader 
                        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDUZ7iULgAMP6dKL_DqVDPds7OJ50FFD5IctlX8TWg6j1hb3VQ1vJch6F4a5Fi-MjdEDYZLU8NVSxs9SS_4KPQe8KE0WQsUykE5v-DrJnDuHgmt166WbFCfknyPiZSfsCIy-STkqR47fxUDhx9bD9y9Zfv0vIE8oDJa4z4yUTVeOC0PYdZvb_kzmYTQGRAfunQOL6KVnZityhTkgbOmdIzE-aTGkVv3D0HjvVLLfCpi8ftaSXMFLENCqoYwoCNIbArGbJAWwXunlwj0"
                        : "https://lh3.googleusercontent.com/aida-public/AB6AXuDv_yiorjYzWFH3zNQvWbU-zz-bc6Eo0cnrnayY2fCXWJWMQo7au5MVEHAHD9XnZ78u_i_-l_x3fGggWfJzUsFDAwe1rYZe5dNmtKCWyY2BCqbpWEn4LEOjYwDCySWxg7kJurYEJjxbF8PysPjeKQJVHEP5ZQ45VU1NAQwDax4hPnWOn-fYHAJ-clGLMWvIFtOacJRVm5XlJtxVAkF_H0Byez-2_MFBbcP8bVCD9-QluqvmLldN2PPtC2dJzRE4PCOZNdZOevn0g78-"
                      } 
                      alt="Technician" 
                    />
                  </div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{assignment.technician_name || `ช่างเทคนิค ID: ${assignment.technician_id}`}</span>
                    <span className={styles.memberRole}>{assignment.is_leader ? 'หัวหน้าชุดช่าง (Lead Technician)' : 'ช่างเทคนิค (Technician)'}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Logs Section (Maintaining for User tracking) */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>ประวัติการดำเนินการ (Logs)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logsLoading ? (
              <p style={{ textAlign: 'center', fontSize: '14px' }}>กำลังโหลด...</p>
            ) : logs.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '14px' }}>ไม่พบประวัติการดำเนินการ</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '0.75rem', fontSize: '14px' }}>
                  <div style={{ minWidth: '100px', color: 'var(--color-on-surface-variant)', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '500' }}>
                      {new Date(log.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                    <span style={{ fontSize: '12px' }}>
                      {new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '600' }}>{getStatusBadge(log.status_to).label}</span>
                    {log.note && <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-on-surface-variant)' }}>{log.note}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div className={styles.bottomSpacer}></div>
      </div>

      {/* Bottom Action Bar */}
      <div className={styles.bottomActionBar}>
        <button className={styles.primaryButton} disabled={refreshing}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
          รับงาน (Accept Work)
        </button>
        <button 
          className={styles.secondaryButton}
          onClick={() => setIsOnHoldReportOpen(true)}
          disabled={refreshing}
        >
          <span className="material-symbols-outlined">pause_circle</span>
          แจ้งปัญหา/หยุดงานชั่วคราว (On Hold)
        </button>
      </div>

      <OnHoldReport 
        isOpen={isOnHoldReportOpen}
        onClose={() => setIsOnHoldReportOpen(false)}
        jobId={request.id}
        jobTitle={request.title}
        onConfirm={handleOnHoldConfirm}
      />
    </Layout>
  );
};

export default JobDetail;
