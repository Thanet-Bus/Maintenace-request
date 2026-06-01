import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import styles from './AdminRequests.module.css';
import { API_BASE_URL } from '../../config';
import type { RepairRequest } from '../../types/types';

const INITIAL_LOAD_COUNT = 15;
const LOAD_MORE_COUNT = 10;

const AdminRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Lazy loading state
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
  const observerTarget = useRef<HTMLTableRowElement | null>(null);

  const fetchRequests = useCallback( async () => {
    return new Promise<void>((resolve, reject) => {
      setLoading(true);
      fetch(`${API_BASE_URL}/repair-requests`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch requests');
          return res.json();
        })
        .then(data => {
          setRequests(data);
          resolve();
        })
        .catch(error => {
          console.error('Error fetching requests:', error);
          reject(error);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    fetchRequests().catch(() => {
        if (!isMounted) return;
    });

    return () => {
      isMounted = false;
    };
  }, [fetchRequests]);

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === '' || req.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#REQ-${req.id.toString().padStart(4, '0')}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredRequests.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredRequests.length]);

  const visibleRequests = filteredRequests.slice(0, visibleCount);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'รอดำเนินการ', className: styles.statusPill, dotClass: styles.statusDot, color: 'var(--color-tertiary)' };
      case 'ASSIGNED':
        return { label: 'มอบหมายแล้ว', className: styles.statusPillInactive, dotClass: styles.statusDotInactive, color: 'var(--color-status-assigned)' };
      case 'IN_PROGRESS':
        return { label: 'กำลังซ่อม', className: styles.statusPill, dotClass: styles.statusDot, color: 'var(--color-primary)' };
      case 'COMPLETED':
        return { label: 'เสร็จสิ้น', className: styles.statusPillInactive, dotClass: styles.statusDotInactive, color: 'var(--color-outline)' };
      case 'ON_HOLD':
        return { label: 'พักงาน', className: styles.statusPillInactive, dotClass: styles.statusDotInactive, color: 'var(--color-status-onhold)' };
      case 'CANCELLED':
        return { label: 'ยกเลิก', className: styles.statusPillInactive, dotClass: styles.statusDotInactive, color: 'var(--color-error)' };
      default:
        return { label: status, className: styles.statusPillInactive, dotClass: styles.statusDotInactive, color: 'inherit' };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      timeZone: 'Asia/Bangkok'
    });
  };
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    }) + ' น.';
  };

  return (
    <AdminLayout>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>การจัดการใบแจ้งซ่อม</h1>
          <p className={styles.pageSubtitle}>Manage, assign, and track maintenance requests efficiently.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterLabel}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
          ตัวกรอง:
        </div>
        <select 
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">สถานะทั้งหมด</option>
          <option value="PENDING">รอดำเนินการ</option>
          <option value="ASSIGNED">มอบหมายแล้ว</option>
          <option value="IN_PROGRESS">กำลังซ่อม</option>
          <option value="ON_HOLD">พักงาน</option>
          <option value="COMPLETED">เสร็จสิ้น</option>
          <option value="CANCELLED">ยกเลิก</option>
        </select>
        <div className={styles.dateInputWrapper}>
          <span className={`material-symbols-outlined ${styles.dateIcon}`}>calendar_month</span>
          <input className={styles.dateInput} placeholder="ช่วงวันที่" type="text" />
        </div>
        <button className={styles.resetButton} onClick={() => {
            setSearchQuery('');
            setStatusFilter('');
            fetchRequests();
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
          รีเซ็ต
        </button>
      </div>

      {/* Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>ID</th>
                <th>หัวข้อ / สถานที่</th>
                <th>ผู้แจ้ง</th>
                <th>สถานะ</th>
                <th>วันที่สร้าง</th>
                <th>วันนัดหมาย</th>
                <th style={{ textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลดข้อมูล...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>ไม่พบรายการแจ้งซ่อม</td>
                </tr>
              ) : (
                <>
                  {visibleRequests.map((req) => {
                    const badge = getStatusBadge(req.status);
                    const isPending = req.status === 'PENDING';
                    const isOnHold = req.status === 'ON_HOLD';
                    return (
                      <tr key={req.id} className={styles.row}>
                        <td>
                          <span className={isPending ? styles.requestId : styles.requestIdInactive}>
                            #REQ-{req.id.toString().padStart(4, '0')}
                          </span>
                        </td>
                        <td>
                          <div className={styles.issueInfo}>
                            <span className={styles.issueTitle}>{req.title}</span>
                            <div className={styles.issueLocation}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                              {req.location}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.requesterInfo}>
                            <div className={`${styles.smallAvatar} ${styles.initialAvatar}`}>
                              ID
                            </div>
                            <span>User {req.requester_id}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.statusGroup}>
                            <span className={badge.className}>
                              <span className={badge.dotClass} style={{ backgroundColor: badge.color }}></span>
                              {badge.label}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.dateInfo}>
                            {formatDate(req.created_at)}<br />
                            <span className={styles.timeInfo}>{formatTime(req.created_at)}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.dateInfo}>
                            {req.appointment_date ? (
                              <>
                                {formatDate(req.appointment_date)}<br />
                                <span className={styles.timeInfo}>{formatTime(req.appointment_date)}</span>
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionGroup}>
                            <button 
                              className={styles.detailButton} 
                              onClick={() => navigate(`/admin/request/edit/${req.id}`)}
                            >
                              แก้ไข
                            </button>
                            {isPending && (
                              <button 
                                className={styles.assignButton}
                                onClick={() => navigate(`/admin/assign-team/${req.id}`)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                                มอบหมายงาน
                              </button>
                            )}
                            {isOnHold && (
                              <button 
                                className={styles.onHoldButton}
                                onClick={() => navigate(`/admin/on-hold/${req.id}`)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_clock</span>
                                จัดการงานที่พักไว้
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {visibleCount < filteredRequests.length && (
                    <tr ref={observerTarget}>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-on-surface-variant)' }}>
                        กำลังโหลดเพิ่มเติม...
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Info Footer (Replaced Pagination) */}
        <div className={styles.paginationFooter}>
          <span className={styles.pageInfo}>แสดง {visibleRequests.length} จาก {filteredRequests.length} รายการ</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRequests;
