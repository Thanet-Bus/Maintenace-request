import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import type { RepairRequest, RepairLog } from '../types/types';
import styles from './UserDashboard.module.css';
import { API_BASE_URL } from "../config";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [requestLogs, setRequestLogs] = useState<{ [key: number]: RepairLog[] }>({});
  const [logsLoading, setLogsLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Fetch requests for user 1
    let isMounted = true;
    fetch(`${API_BASE_URL}/repair-requests/requester/1`)
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setRequests(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch API", err);
        if (isMounted) {
          setRequests([]);
          setLoading(false);
        }
      });
      
      return () => {
        isMounted = false;
      };
  }, []);

  const toggleLogs = async (requestId: number) => {
    if (expandedRequestId === requestId) {
      setExpandedRequestId(null);
      return;
    }

    setExpandedRequestId(requestId);

    // Only fetch if not already loaded
    if (!requestLogs[requestId]) {
      setLogsLoading(prev => ({ ...prev, [requestId]: true }));
      try {
        const response = await fetch(`${API_BASE_URL}/logs/request/${requestId}`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        const data = await response.json();
        setRequestLogs(prev => ({ ...prev, [requestId]: data }));
      } catch (err) {
        console.error("Failed to fetch logs", err);
        setRequestLogs(prev => ({ ...prev, [requestId]: [] }));
      } finally {
        setLogsLoading(prev => ({ ...prev, [requestId]: false }));
      }
    }
  };

  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'PENDING' || r.status === 'ON_HOLD').length;
  const inProgressCount = requests.filter(r => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED').length;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    }) + ' น.';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'รอดำเนินการ', icon: 'pending', color: 'var(--color-tertiary-container)' };
      case 'ASSIGNED':
        return { label: 'รับงาน', icon: 'pending', color: 'var(--color-tertiary-container)' };
      case 'IN_PROGRESS':
        return { label: 'กำลังซ่อม', icon: 'build', color: 'var(--color-primary)' };
      case 'COMPLETED':
        return { label: 'เสร็จสิ้น', icon: 'check_circle', color: 'var(--color-outline)' };
      case 'ON_HOLD':
        return { label: 'พักงาน', icon: 'pause_circle', color: 'var(--color-error)' };
      case 'CANCELLED':
        return { label: 'ยกเลิก', icon: 'cancel', color: 'var(--color-error)' };
      default:
        return { label: status, icon: 'info', color: 'var(--color-on-surface-variant)' };
    }
  };

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
            <span className={styles.summaryCount} style={{ color: 'var(--color-secondary)' }}>{loading ? '-' : totalCount}</span>
            <span className={styles.summaryLabel}>งานทั้งหมด</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCount} style={{ color: 'var(--color-tertiary-container)' }}>{loading ? '-' : pendingCount}</span>
            <span className={styles.summaryLabel}>รอดำเนินการ</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCount} style={{ color: 'var(--color-primary)' }}>{loading ? '-' : inProgressCount}</span>
            <span className={styles.summaryLabel}>กำลังซ่อม</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryCount} style={{ color: 'var(--color-outline)' }}>{loading ? '-' : completedCount}</span>
            <span className={styles.summaryLabel}>เสร็จสิ้น</span>
          </div>
        </section>

        {/* Request List Section */}
        <section className={styles.requestSection}>
          <h3 className={styles.sectionTitle}>รายการแจ้งซ่อมล่าสุด</h3>
          
          {loading ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>กำลังโหลดข้อมูล...</p>
          ) : requests.length === 0 ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>ยังไม่มีรายการแจ้งซ่อม</p>
          ) : (
            <>
              {requests.slice(0, 3).map((request) => {
                const badge = getStatusBadge(request.status);
                const progressPercentage = request.status === 'COMPLETED' ? '100%' : (request.status === 'IN_PROGRESS' ? '50%' : '0%');
                const isExpanded = expandedRequestId === request.id;
                const logs = requestLogs[request.id] || [];
                const isLoadingLogs = logsLoading[request.id];

                return (
                  <div 
                    key={request.id} 
                    className={styles.jobCard} 
                    onClick={() => toggleLogs(request.id)}
                    style={{ cursor: 'pointer' , marginBottom: '1rem'}}
                  >
                    <div className={styles.jobHeader}>
                      <span className={styles.jobId}>#REQ-{request.id.toString().padStart(4, '0')}</span>
                      <span className={styles.statusBadge} style={{ color: badge.color, backgroundColor: `color-mix(in srgb, ${badge.color} 10%, transparent)` }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{badge.icon}</span>
                        {badge.label}
                      </span>
                    </div>
                    
                    <h4 className={styles.jobTitle}>{request.title}</h4>
                    
                    <div className={styles.jobDetails}>
                      <div className={styles.detailItem}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>location_on</span>
                        <span>{request.location}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className="material-symbols-outlined">event</span>
                        <span>แจ้งเมื่อ: {formatDate(request.created_at)}</span>
                      </div>
                    </div>

                    {request.appointment_date && (
                      <div className={styles.appointmentBox}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>calendar_clock</span>
                        <div>
                          <p className={styles.appointmentLabel}>เวลานัดหมายเข้าซ่อม</p>
                          <p className={styles.appointmentTime}>{formatDateTime(request.appointment_date)}</p>
                        </div>
                      </div>
                    )}

                    {/* Real-time Status Tracking Bar */}
                    <div className={styles.trackingContainer}>
                      <div className={styles.trackingLine}>
                        <div className={styles.trackingProgress} style={{ width: progressPercentage }}></div>
                      </div>
                      <div className={styles.trackingSteps}>
                        <div className={styles.step}>
                          <div className={`${styles.stepDot} ${styles.stepActive}`}></div>
                          <span className={styles.stepLabel} style={{ color: 'var(--color-primary)' }}>รับเรื่อง</span>
                        </div>
                        <div className={styles.step}>
                          <div className={`${styles.stepDot} ${progressPercentage !== '0%' ? styles.stepActive : ''} ${progressPercentage === '50%' ? styles.stepCurrent : ''}`}></div>
                          <span className={styles.stepLabel} style={{ color: progressPercentage !== '0%' ? 'var(--color-primary)' : 'inherit', fontWeight: progressPercentage === '50%' ? 'bold' : 'normal' }}>กำลังซ่อม</span>
                        </div>
                        <div className={styles.step}>
                          <div className={`${styles.stepDot} ${progressPercentage === '100%' ? styles.stepActive : ''}`}></div>
                          <span className={styles.stepLabel} style={{ color: progressPercentage === '100%' ? 'var(--color-primary)' : 'inherit' }}>เสร็จสิ้น</span>
                        </div>
                      </div>
                    </div>

                    {/* Logs Dropdown Toggle */}
                    <div className={styles.logsToggle}>
                      <span>{isExpanded ? 'ปิดรายละเอียด' : 'ดูรายละเอียดการซ่อม'}</span>
                      <span className="material-symbols-outlined">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>

                    {/* Expanded Logs Section */}
                    {isExpanded && (
                      <div className={styles.logsContainer} onClick={(e) => e.stopPropagation()}>
                        {isLoadingLogs ? (
                          <p style={{ textAlign: 'center', fontSize: '14px' }}>กำลังโหลดรายละเอียด...</p>
                        ) : logs.length === 0 ? (
                          <p style={{ textAlign: 'center', fontSize: '14px' }}>ไม่พบประวัติการดำเนินการ</p>
                        ) : (
                          logs.map((log) => (
                            <div key={log.id} className={styles.logItem}>
                              <div className={styles.logTimeline}>
                                <div className={styles.logDot}></div>
                                <div className={styles.logLine}></div>
                              </div>
                              <div className={styles.logContent}>
                                <div className={styles.logHeader}>
                                  <span className={styles.logStatus}>
                                    {getStatusBadge(log.status_to).label}
                                  </span>
                                  <span className={styles.logTime}>{formatDateTime(log.created_at)}</span>
                                </div>
                                {log.note && (
                                  <div className={styles.logNote}>{log.note}</div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {requests.length > 3 && (
                <button 
                  className={styles.seeAllButton}
                  onClick={() => navigate('/history')}
                >
                  ดูประวัติการแจ้งซ่อมทั้งหมด
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default UserDashboard;
