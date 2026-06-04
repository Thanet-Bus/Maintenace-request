import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import type { RepairRequest, RepairLog, AssignmentDetail} from '../types/types';
import styles from './UserDashboard.module.css'; // Reusing dashboard styles for consistency
import { API_BASE_URL } from "../config";
import { getStatusBadge } from '../utils/statusUtils';

const INITIAL_LOAD_COUNT = 5;
const LOAD_MORE_COUNT = 5;

const History: React.FC = () => {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [requestLogs, setRequestLogs] = useState<{ [key: number]: RepairLog[] }>({});
  const [logsLoading, setLogsLoading] = useState<{ [key: number]: boolean }>({});
  const [requestAssignments, setRequestAssignments] = useState<{ [key: number]: AssignmentDetail[] }>({});

  // Lazy loading state
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Fetch all requests for user 1
    let isMounted = true;
    fetch(`${API_BASE_URL}/repair-requests/requester/1`)
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data: RepairRequest[]) => {
        if (isMounted) {
          setRequests(data);
          setLoading(false);

          data.forEach(req => {
            fetch(`${API_BASE_URL}/assignments/repair-request/${req.id}`)
              .then(res => res.ok ? res.json() : null)
              .then(assignData => {
                if (isMounted && assignData && assignData.technicians) {
                  setRequestAssignments(prev => ({ ...prev, [req.id]: assignData.technicians }));
                }
              })
              .catch(err => console.error("Failed to fetch assignments", err));
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch API", err);
        if (isMounted) {
          setLoading(false);
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, requests.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [requests.length]);

  const visibleRequests = requests.slice(0, visibleCount);

  const toggleLogs = async (requestId: number) => {
    if (expandedRequestId === requestId) {
      setExpandedRequestId(null);
      return;
    }

    setExpandedRequestId(requestId);

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

  return (
    <Layout title="ประวัติการแจ้งซ่อม">
      <div className={styles.container}>
        <section className={styles.requestSection}>
          <h3 className={styles.sectionTitle}>รายการแจ้งซ่อมทั้งหมด</h3>
          
          {loading ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>กำลังโหลดข้อมูล...</p>
          ) : requests.length === 0 ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>ยังไม่มีรายการแจ้งซ่อม</p>
          ) : (
            <>
              {visibleRequests.map((request) => {
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
                    style={{ cursor: 'pointer', marginBottom: '1rem' }}
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

                    {/* Technicians & Images Section */}
                    <div>
                      {/* Technicians */}
                      {requestAssignments[request.id] && requestAssignments[request.id].length > 0 && (
                        <div className={styles.techAndImagesSection}>
                          <p className={styles.sectionSubtitle}>ทีมช่างที่รับผิดชอบ</p>
                          <div className={styles.techList}>
                            {requestAssignments[request.id].map(assignment => (
                              <div key={assignment.technician_id} className={styles.techItem}>
                                <div className={`${styles.techAvatar} ${assignment.is_leader ? styles.techAvatarLead : styles.techAvatarRegular}`}>
                                  <img 
                                    src={assignment.is_leader 
                                      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDUZ7iULgAMP6dKL_DqVDPds7OJ50FFD5IctlX8TWg6j1hb3VQ1vJch6F4a5Fi-MjdEDYZLU8NVSxs9SS_4KPQe8KE0WQsUykE5v-DrJnDuHgmt166WbFCfknyPiZSfsCIy-STkqR47fxUDhx9bD9y9Zfv0vIE8oDJa4z4yUTVeOC0PYdZvb_kzmYTQGRAfunQOL6KVnZityhTkgbOmdIzE-aTGkVv3D0HjvVLLfCpi8ftaSXMFLENCqoYwoCNIbArGbJAWwXunlwj0"
                                      : "https://lh3.googleusercontent.com/aida-public/AB6AXuDv_yiorjYzWFH3zNQvWbU-zz-bc6Eo0cnrnayY2fCXWJWMQo7au5MVEHAHD9XnZ78u_i_-l_x3fGggWfJzUsFDAwe1rYZe5dNmtKCWyY2BCqbpWEn4LEOjYwDCySWxg7kJurYEJjxbF8PysPjeKQJVHEP5ZQ45VU1NAQwDax4hPnWOn-fYHAJ-clGLMWvIFtOacJRVm5XlJtxVAkF_H0Byez-2_MFBbcP8bVCD9-QluqvmLldN2PPtC2dJzRE4PCOZNdZOevn0g78-"
                                    } 
                                    alt="Tech" 
                                  />
                                </div>
                                <div>
                                  <span className={assignment.is_leader ? styles.techNameLead : styles.techNameRegular}>{assignment.technician_name || `ช่างเทคนิค ID: ${assignment.technician_id}`}</span>
                                  {assignment.is_leader && <span className={styles.leadBadge}>หัวหน้า</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                          logs.map((log) => {
                            const logBadge = getStatusBadge(log.status_to);
                            return (
                              <div key={log.id} className={styles.logItem}>
                                <div className={styles.logTimeline}>
                                  <div className={styles.logDot} style={{ backgroundColor: logBadge.color }}></div>
                                  <div className={styles.logLine}></div>
                                </div>
                                <div className={styles.logContent}>
                                  <div className={styles.logHeader}>
                                    <span className={styles.logStatus}>
                                      {logBadge.label}
                                    </span>
                                    <span className={styles.logTime}>{formatDateTime(log.created_at)}</span>
                                  </div>
                                  {log.note && (
                                    <div className={styles.logNote}>{log.note}</div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {visibleCount < requests.length && (
                <div ref={observerTarget} style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-on-surface-variant)' }}>
                  กำลังโหลดเพิ่มเติม...
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default History;
