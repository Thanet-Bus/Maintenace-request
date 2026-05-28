import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import styles from './AdminRequests.module.css';
import { API_BASE_URL } from '../config';
import type { RepairRequest } from '../types/types';

const AdminRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
        return { label: 'พักงาน', className: styles.statusPillInactive, dotClass: styles.statusDotInactive, color: 'var(--color-error)' };
      case 'CANCELLED':
        return { label: 'ยกเลิก', className: styles.statusPillInactive, dotClass: styles.statusDotInactive, color: 'var(--color-error)' };
      default:
        return { label: status, className: styles.statusPillInactive, dotClass: styles.statusDotInactive, color: 'inherit' };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  };

  return (
    <AdminLayout>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>การจัดการใบแจ้งซ่อม</h1>
          <p className={styles.pageSubtitle}>Manage, assign, and track maintenance requests efficiently.</p>
        </div>
        <div className={styles.searchWrapper}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input 
            className={styles.searchInput} 
            placeholder="ค้นหา รหัส, หัวข้อ, สถานที่..." 
            type="text" 
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterLabel}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
          ตัวกรอง:
        </div>
        <select className={styles.filterSelect}>
          <option value="">สถานะทั้งหมด</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="active">กำลังดำเนินการ</option>
          <option value="completed">เสร็จสิ้น</option>
        </select>
        <div className={styles.dateInputWrapper}>
          <span className={`material-symbols-outlined ${styles.dateIcon}`}>calendar_month</span>
          <input className={styles.dateInput} placeholder="ช่วงวันที่" type="text" />
        </div>
        <button className={styles.resetButton} onClick={fetchRequests}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
          รีเฟรช
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
                <th style={{ textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลดข้อมูล...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>ไม่พบรายการแจ้งซ่อม</td>
                </tr>
              ) : (
                requests.map((req) => {
                  const badge = getStatusBadge(req.status);
                  const isPending = req.status === 'PENDING';
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
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionGroup}>
                          <button 
                            className={styles.detailButton} 
                            onClick={() => navigate(`/request/${req.id}`)}
                          >
                            ดูรายละเอียด
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={styles.paginationFooter}>
          <span className={styles.pageInfo}>แสดง {requests.length} รายการ</span>
          <div className={styles.paginationActions}>
            <button className={styles.pageButton} disabled>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
            </button>
            <button className={`${styles.pageButton} ${styles.pageButtonActive}`}>1</button>
            <button className={styles.pageButton} disabled>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRequests;
