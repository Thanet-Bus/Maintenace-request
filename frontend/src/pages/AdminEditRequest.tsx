import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import styles from './AdminEditRequest.module.css';
import { API_BASE_URL } from '../config';
import type { RepairRequest } from '../types/types';
import type { SubmitEvent } from 'react';

const AdminEditRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
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
    }) + ' น.';
  };

  const fetchRequest = useCallback((signal?: AbortSignal) => {
    if (!id) return;
    
    return new Promise<void>((resolve, reject) => {
      setLoading(true);
      fetch(`${API_BASE_URL}/repair-requests/${id}`, { signal })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch request');
          return res.json();
        })
        .then(data => {
          setRequest(data);
          setTitle(data.title);
          setLocation(data.location);
          setDescription(data.description || '');
          setStatus(data.status);
          resolve();
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Error fetching request:', error);
          reject(error);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    fetchRequest(controller.signal)?.catch(() => {
      if (!isMounted) return;
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchRequest]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
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

      alert('แก้ไขข้อมูลสำเร็จ');
      navigate('/admin/requests');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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

                {/* Date Info */}
                <div>
                    <p className={styles.infoLabel}>วันที่แจ้ง</p>
                    <p className={styles.infoValue}>{formatDateTime(request.created_at)}</p>
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

              <form className={styles.form} onSubmit={handleSubmit}>
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
    </AdminLayout>
  );
};

export default AdminEditRequest;
