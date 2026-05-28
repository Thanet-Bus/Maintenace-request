import React from 'react';
import type { RepairRequest } from '../types/types';
import styles from './JobCard.module.css';

interface JobCardProps {
  request: RepairRequest;
  onClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ request, onClick }) => {
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

  const badge = getStatusBadge(request.status);
  const progressPercentage = request.status === 'COMPLETED' ? '100%' : (request.status === 'IN_PROGRESS' ? '50%' : '0%');

  return (
    <div 
      className={styles.jobCard} 
      onClick={onClick}
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
    </div>
  );
};

export default JobCard;
