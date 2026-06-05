import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import styles from './AdminEditRequest.module.css';
import { API_BASE_URL } from '../../config';
import type { RepairRequest, TechnicianDetail, RepairLog, RepairImage } from '../../types/types';
import { getStatusBadge } from '../../utils/statusUtils';

const AdminEditRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [images, setImages] = useState<RepairImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom Alert / Modal State
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

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

  const fetchRequestDetails = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`${API_BASE_URL}/repair-requests/${id}`);
    if (!res.ok) {
      throw new Error('Failed to fetch request');
    }
    const data = await res.json();
    setRequest(data);
    setTitle(data.title);
    setLocation(data.location);
    setDescription(data.description || '');
    setStatus(data.status);
  }, [id]);

  const fetchLogs = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/logs/request/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  }, [id]);

  const fetchImages = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/repair-images/repair-request/${id}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error("Failed to fetch images", err);
    }
  }, [id]);

  const fetchAssignments = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/assignments/repair-request/${id}`);
      const data = await res.json();
      if (data.technicians) {
        const techDetails: TechnicianDetail[] = await Promise.all(
          data.technicians.map(async (t: { technician_id: number; is_leader: boolean }) => {
            try {
              const userRes = await fetch(`${API_BASE_URL}/users/${t.technician_id}`);
              const userData = await userRes.json();
              return {
                id: t.technician_id,
                name: userData.name || `Technician ${t.technician_id}`,
                is_leader: t.is_leader,
              };
            } catch {
              return {
                id: t.technician_id,
                name: `Technician ${t.technician_id}`,
                is_leader: t.is_leader,
              };
            }
          })
        );
        setRequest(prev => prev ? { ...prev, technicians: techDetails } : prev);
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    window.scrollTo(0, 0);

    async function loadInitialData() {
      try {
        await Promise.all([
          fetchRequestDetails(),
          fetchAssignments(),
          fetchLogs(),
          fetchImages(),
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
  }, [id, fetchRequestDetails, fetchAssignments, fetchLogs, fetchImages]);

  const handlePreSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!title.trim() || !location.trim()) {
      setErrorMessage("กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const executeSubmit = async () => {
    if (!id) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/repair-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          location,
          description,
          status,
          note: note || `Admin edited request details`
        }),
      });

      if (!response.ok) throw new Error('Failed to update request');

      navigate('/admin/requests');
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setIsConfirmModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.container}>
          <p style={{ textAlign: 'center', marginTop: '40px' }}>กำลังโหลด...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!request) {
    return (
      <AdminLayout>
        <div className={styles.container}>
          <p style={{ textAlign: 'center', marginTop: '40px' }}>ไม่พบข้อมูลคำร้อง</p>
          <button className={styles.cancelButton} onClick={() => navigate('/admin/requests')}>กลับ</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className={styles.pageTitle}>แก้ไขใบแจ้งซ่อม (#REQ-{request.id.toString().padStart(4, '0')})</h2>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className={styles.mainGrid}>
          {/* Left Pane: Request Details (Current) */}
          <div className={styles.detailsPane}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>info</span>
                รายละเอียดปัจจุบัน
              </h3>
              
              <div className={styles.detailsList}>
                {/* Requester Info */}
                <div className={styles.infoBox}>
                  <div className={styles.infoIcon}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className={styles.infoLabel}>ผู้แจ้งซ่อม</p>
                    <p className={styles.infoValue}>User {request.requester_id}</p>
                    <p className={styles.infoSubValue}>{request.location}</p>
                  </div>
                </div>

                 {/* Problem Description */}
                 <div className={styles.problemSection}>
                   <p className={styles.infoLabel}>หัวข้อปัญหา</p>
                   <p className={styles.problemTitle}>{request.title}</p>
                   <div className={styles.descriptionBox}>
                     {request.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                   </div>
                 </div>

                 {/* Problem Photos */}
                 <div>
                   <h3 className={styles.sectionTitle}>รูปภาพก่อนซ่อม</h3>
                   <div className={styles.photoGrid}>
                     {images.filter((img) => img.image_type === "REQUEST" || img.image_type === "OTHER").length > 0 ? (
                       images
                         .filter((img) => img.image_type === "REQUEST" || img.image_type === "OTHER")
                         .map((image) => (
                           <div 
                             key={image.id} 
                             className={styles.photoItem}
                             onClick={() => setSelectedImageUrl(`${API_BASE_URL.replace(/\/api$/, "")}${image.image_url}`)}
                             style={{ cursor: 'pointer' }}
                           >
                             <img
                               src={`${API_BASE_URL.replace(/\/api$/, "")}${image.image_url}`}
                               alt="Problem"
                             />
                           </div>
                         ))
                     ) : (
                       <p
                         style={{
                           fontSize: "14px",
                           textAlign: "center",
                           color: "var(--color-on-surface-variant)",
                         }}
                       >
                         ไม่มีรูปภาพประกอบ
                       </p>
                     )}
                   </div>
                 </div>

                 {/* Date Info */}
                <div>
                    <p className={styles.infoLabel}>วันที่แจ้ง</p>
                    <p className={styles.infoValue}>{formatDateTime(request.created_at)}</p>
                </div>
                <div>
                    <p className={styles.infoLabel}>วันที่นัดหมาย</p>
                    <p className={styles.infoValue}>
                        {request.appointment_date ? formatDateTime(request.appointment_date) : '-'}
                    </p>
                </div>

                {/* Assigned Technicians */}
                {request.technicians && request.technicians.length > 0 && (
                  <div className={styles.techSection}>
                    <p className={styles.infoLabel}>ช่างที่ได้รับมอบหมาย</p>
                    <div className={styles.techListDetailed}>
                      {request.technicians.map(tech => (
                        <div key={tech.id} className={styles.techItemDetailed}>
                          <div className={styles.techMainInfo}>
                            {tech.profile_image_url ? (
                              <img className={styles.techAvatar} src={tech.profile_image_url} alt={tech.name} />
                            ) : (
                              <div className={styles.initialAvatar}>{tech.name.charAt(0)}</div>
                            )}
                            <div>
                              <p className={styles.techName}>{tech.name}</p>
                              {tech.is_leader ? (
                                <span className={styles.leaderBadge}>หัวหน้าทีม</span>
                              ) : (
                                <span className={styles.assistBadge}>ช่างร่วม</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Logs */}
                <div className={styles.techSection}>
                  <p className={styles.infoLabel}>ประวัติการดำเนินการ</p>
                  {logs.length === 0 ? (
                    <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginTop: '0.5rem' }}>ไม่พบประวัติการดำเนินการ</p>
                  ) : (
                    <div className={styles.logsContainer}>
                      {logs.map((log) => {
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
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Edit Form */}
          <div className={styles.formPane}>
            <div className={`${styles.card} ${styles.accentCard}`}>
              <div className={styles.accentBar}></div>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>edit_note</span>
                ฟอร์มแก้ไขข้อมูล
              </h3>

              <form className={styles.form} onSubmit={handlePreSubmit}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>หัวข้อปัญหา <span className={styles.required}>*</span></label>
                  <input 
                    className={styles.input}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>สถานที่ <span className={styles.required}>*</span></label>
                  <div className={styles.inputWithIcon}>
                    <span className={`material-symbols-outlined ${styles.prefixIcon}`}>location_on</span>
                    <input 
                      className={styles.input}
                      type="text"
                      style={{ paddingLeft: '2.5rem' }}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>สถานะ</label>
                  <select 
                    className={styles.select}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="PENDING">รอดำเนินการ (PENDING)</option>
                    <option value="ASSIGNED">มอบหมายแล้ว (ASSIGNED)</option>
                    <option value="IN_PROGRESS">กำลังซ่อม (IN_PROGRESS)</option>
                    <option value="ON_HOLD">พักงาน (ON_HOLD)</option>
                    <option value="COMPLETED">เสร็จสิ้น (COMPLETED)</option>
                    <option value="CANCELLED">ยกเลิก (CANCELLED)</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>รายละเอียด</label>
                  <textarea 
                    className={styles.textarea}
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติม..."
                  />
                </div>
                
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>บันทึกจากผู้ดูแลระบบ</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="เพิ่มรายละเอียดเพิ่มเติม..." 
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>

                {/* Error Message */}
                {errorMessage && !isConfirmModalOpen && (
                  <div style={{ color: 'var(--color-error)', fontSize: '14px', marginTop: '0.5rem', marginBottom: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--color-error-container)', borderRadius: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>error</span>
                    {errorMessage}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button 
                    className={styles.cancelButton} 
                    type="button" 
                    onClick={() => navigate(-1)}
                    disabled={submitting}
                  >
                    ยกเลิก
                  </button>
                  <button 
                    className={styles.confirmButton} 
                    type="submit"
                    disabled={submitting}
                  >
                    <span className="material-symbols-outlined">save</span>
                    {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Edit Save */}
      {isConfirmModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !submitting && setIsConfirmModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={`material-symbols-outlined ${styles.modalIcon}`}>save_as</span>
              <h3 className={styles.modalTitle}>ยืนยันการแก้ไขข้อมูล</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                คุณต้องการบันทึกการแก้ไขข้อมูลใบแจ้งซ่อม <strong>#REQ-{request.id.toString().padStart(4, '0')}</strong> ใช่หรือไม่?
              </p>
              {errorMessage && (
                <div style={{ color: 'var(--color-error)', fontSize: '14px', marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-error-container)', borderRadius: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>error</span>
                  {errorMessage}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancelButton} 
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={submitting}
              >
                ย้อนกลับ
              </button>
              <button 
                className={styles.modalConfirmButton} 
                onClick={executeSubmit}
                disabled={submitting}
              >
                {submitting ? 'กำลังบันทึก...' : 'ยืนยันการบันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImageUrl && (
        <div 
          className={styles.imageOverlay}
          onClick={() => setSelectedImageUrl(null)}
        >
          <div className={styles.imageOverlayContent}>
            <button 
              className={styles.imageOverlayCloseButton}
              onClick={() => setSelectedImageUrl(null)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
            </button>
            <img 
              src={selectedImageUrl} 
              alt="Fullscreen view" 
              className={styles.imageOverlayImage}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEditRequest;
