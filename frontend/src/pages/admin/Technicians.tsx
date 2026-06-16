import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import styles from './Technicians.module.css';
import JobCard from '../../components/JobCard';
import { useTechnicians } from '../../hooks/admin/useTechnicians';
import { apiClient } from '../../utils/apiClient';

interface TechnicianInviteResponse {
  token: string;
  expires_in_seconds: number;
  expires_at: string;
}

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

  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  const copyText = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const buildInviteUrl = (token: string) => {
    return `${window.location.origin}/login?invite_token=${encodeURIComponent(token)}`;
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;

    try {
      await copyText(inviteUrl);
      setInviteMessage('คัดลอกลิงก์เชิญเรียบร้อยแล้ว');
      setInviteError('');
    } catch {
      setInviteError('ไม่สามารถคัดลอกลิงก์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleGenerateInvite = async () => {
    setIsGeneratingInvite(true);
    setInviteMessage('');
    setInviteError('');

    try {
      const invite = await apiClient('/auth/technician-invites', {
        method: 'POST',
      }) as TechnicianInviteResponse;

      const url = buildInviteUrl(invite.token);
      setInviteUrl(url);
      await copyText(url);
      setInviteMessage(`สร้างลิงก์เชิญเรียบร้อยแล้ว ลิงก์หมดอายุใน ${invite.expires_in_seconds / 60} นาที`);
    } catch (err: unknown) {
      console.error(err);
      setInviteError(err instanceof Error ? err.message : 'ไม่สามารถสร้างลิงก์เชิญได้');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>รายชื่อช่างเทคนิค</h1>
            <p className={styles.pageSubtitle}>Manage and monitor your maintenance team.</p>
          </div>
          <button className={styles.addBtn} onClick={handleGenerateInvite} disabled={isGeneratingInvite}>
            <span className="material-symbols-outlined">person_add</span>
            {isGeneratingInvite ? 'กำลังสร้างลิงก์...' : 'เพิ่มช่างใหม่'}
          </button>
        </div>

        {inviteMessage && (
          <div className={styles.invitePanel}>
            <p className={styles.inviteMessage}>{inviteMessage}</p>
            {inviteUrl && (
              <div className={styles.inviteLinkRow}>
                <input
                  className={styles.inviteLinkInput}
                  value={inviteUrl}
                  readOnly
                  onFocus={(e) => e.target.select()}
                />
                <button className={styles.copyBtn} type="button" onClick={handleCopyInvite}>
                  คัดลอกอีกครั้ง
                </button>
              </div>
            )}
          </div>
        )}

        {inviteError && <p className={styles.inviteError}>{inviteError}</p>}

        {loading ? (
          <div>
            <span className="material-symbols-outlined">sync</span>
            <p style={{ textAlign: 'center', marginTop: '3rem' }}>กำลังโหลดข้อมูล...</p>
          </div>
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
