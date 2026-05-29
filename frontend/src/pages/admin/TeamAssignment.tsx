import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import styles from './TeamAssignment.module.css';
import { API_BASE_URL } from '../../config';
import type { RepairRequest } from '../../types/types';

type Technician = {
  id: number;
  name: string;
  phone?: string | null;
  profile_image_url?: string | null;
};

const TeamAssignment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<number[]>([]);
  const [leaderId, setLeaderId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequestDetails = useCallback(() => {
    if (!id) return;
    
    return new Promise<void>((resolve, reject) => {
      setLoading(true);
      fetch(`${API_BASE_URL}/repair-requests/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch request");
          return res.json();
        })
        .then(data => {
          setRequest(data);
          resolve();
        })
        .catch(err => {
          console.error(err);
          reject(err);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [id]);

  const fetchTechnicians = useCallback(() => {
    fetch(`${API_BASE_URL}/users/technicians`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch technicians");
        return res.json();
      })
      .then(data => setTechnicians(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    fetchRequestDetails()?.catch(() => {
      if (!isMounted) return;
    });
    fetchTechnicians();

    return () => {
      isMounted = false;
    };
  }, [fetchRequestDetails, fetchTechnicians]);

  const handleTechToggle = (techId: number) => {
    setSelectedTechs(prev => {
      const isSelected = prev.includes(techId);
      if (isSelected) {
        // If removing the leader, reset leaderId
        if (leaderId === techId) setLeaderId(null);
        return prev.filter(id => id !== techId);
      } else {
        // If it's the first tech selected, make them the leader automatically
        if (prev.length === 0) setLeaderId(techId);
        return [...prev, techId];
      }
    });
  };

  const handleSubmit = async () => {
    if (!id || selectedTechs.length === 0 || !appointmentDate || !appointmentTime) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน (วันเวลา และเลือกช่างอย่างน้อย 1 คน)");
      return;
    }

    // Ensure we have a leader if techs are selected
    const finalLeaderId = leaderId || selectedTechs[0];

    const isoDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`).toISOString();

    const payload = {
      repair_request_id: parseInt(id, 10),
      appointment_date: isoDateTime,
      technicians: selectedTechs.map(techId => ({
        technician_id: techId,
        is_leader: techId === finalLeaderId
      }))
    };

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to assign team");
      
      // Optionally update note here via PATCH if required by business logic.

      alert("มอบหมายงานสำเร็จ");
      navigate('/admin/requests');
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการมอบหมายงาน");
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
          <button className={styles.backButton} onClick={() => navigate('/admin/requests')}>กลับ</button>
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
            <h2 className={styles.pageTitle}>มอบหมายทีมช่าง (#REQ-{request.id.toString().padStart(4, '0')})</h2>
          </div>
          <span className={styles.headerBadge}>รอการมอบหมาย</span>
        </div>

        {/* Main Grid Layout */}
        <div className={styles.mainGrid}>
          {/* Left Pane: Request Details */}
          <div className={styles.detailsPane}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>info</span>
                รายละเอียดคำร้อง
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

                {/* Before Photos (Mocked for now as backend doesn't have photos yet) */}
                <div>
                  <p className={styles.infoLabel}>รูปภาพประกอบ (2)</p>
                  <div className={styles.photoGrid}>
                    <img 
                      alt="Leaking AC" 
                      className={styles.thumbnail}
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiAuNTvxwcPJ5KCvaTIm9by8oqN_Nlv0Sw6GVOMRBKBuNt5CXKAiIiis1Pfr6V3jYQxUIyBx9z_jHZRPuf8wmKX8s925jN8XdZzAJAzdk90yz2FMRBnrZMqQz1YDy1yODE_vnq63OB9Z1t0JZBBwdtP1CC4gdYmdKcsaRzEYBAXIA1X3PW7H1lCQB7JCeMmAaNviaU2LRX_0Vgs_AKEbmoMjLmFpxUTrz9Rxe1HO9MXgVvPTZP2pQwbA4k_SrzEsBuI3_ZO78n8oOY" 
                    />
                    <img 
                      alt="Water puddle" 
                      className={styles.thumbnail}
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQb5cXa4xSiSrvuAEul00EcCzLinGj9P4SX9yeYnHcz2S5aAwauyn-i4uA5TIh2JmyFt-vRado8_Di4vCDKKs4LFDLxYsW-hqx2sHSIEkV459d5f17YIEye0fX1yQduHydRRnAYbSqRd9tWs22Nv-IvXOhVMarvFtnNnilNk5xTcOp4y6ef1KfTQPaIj0V3OLy10t624hImCQ_X49ST-jJq8GAhDpPxnDYUvY8uljQfdy1EMu5x0t0jmp18o0sPRFxFKbZoj96eXe9" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Assignment Form */}
          <div className={styles.formPane}>
            <div className={`${styles.card} ${styles.accentCard}`}>
              <div className={styles.accentBar}></div>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>engineering</span>
                ฟอร์มการมอบหมาย
              </h3>

              <form className={styles.form}>
                {/* Date/Time Picker */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>กำหนดวันเวลาเข้าซ่อม <span className={styles.required}>*</span></label>
                  <div className={styles.inputGrid}>
                    <div className={styles.inputWithIcon}>
                      <span className={`material-symbols-outlined ${styles.prefixIcon}`}>calendar_today</span>
                      <input 
                        className={styles.input} 
                        type="date" 
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputWithIcon}>
                      <span className={`material-symbols-outlined ${styles.prefixIcon}`}>schedule</span>
                      <input 
                        className={styles.input} 
                        type="time" 
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Technician Selection */}
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldHeader}>
                    <label className={styles.fieldLabel}>เลือกช่างเทคนิค <span className={styles.required}>*</span></label>
                    <span className={styles.countInfo}>เลือกแล้ว {selectedTechs.length} คน</span>
                  </div>
                  
                  <div className={styles.techList}>
                    {technicians.map((tech) => {
                      const isSelected = selectedTechs.includes(tech.id);
                      const isLeader = leaderId === tech.id;
                      return (
                        <div 
                          key={tech.id} 
                          className={`${styles.techItem} ${isSelected ? styles.techItemSelected : ''}`}
                        >
                          <div className={styles.techMainInfo}>
                            <input 
                              className={styles.checkbox} 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleTechToggle(tech.id)}
                            />
                            {tech.profile_image_url ? (
                              <img className={styles.techAvatar} src={tech.profile_image_url} alt={tech.name} />
                            ) : (
                              <div className={styles.initialAvatar}>{tech.name.charAt(0)}</div>
                            )}
                            <div>
                              <p className={styles.techName}>{tech.name}</p>
                              {tech.phone && <p className={styles.techDesc}>{tech.phone}</p>}
                            </div>
                          </div>
                          {isSelected && (
                            <div className={styles.roleAssignment}>
                              <label className={styles.roleLabel}>
                                <input 
                                  type="radio" 
                                  name={`role-${tech.id}`} 
                                  checked={isLeader}
                                  onChange={() => setLeaderId(tech.id)}
                                /> Lead
                              </label>
                              <label className={styles.roleLabel}>
                                <input 
                                  type="radio" 
                                  name={`role-${tech.id}`} 
                                  checked={!isLeader}
                                  onChange={() => {
                                    if(isLeader && selectedTechs.length > 1) {
                                      setLeaderId(selectedTechs.find(tid => tid !== tech.id) || null);
                                    }
                                  }}
                                /> Assist
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Note Textarea */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>บันทึกจากผู้ดูแลระบบ</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="เพิ่มรายละเอียดเพิ่มเติมหรือข้อควรระวังสำหรับช่าง..." 
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>

                {/* Actions */}
                <div className={styles.formActions}>
                  <button 
                    className={styles.confirmButton} 
                    type="button" 
                    onClick={() => setIsModalOpen(true)}
                    disabled={submitting || selectedTechs.length === 0 || !appointmentDate || !appointmentTime}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    ยืนยันการมอบหมาย
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !submitting && setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={`material-symbols-outlined ${styles.modalIcon}`}>person_add</span>
              <h3 className={styles.modalTitle}>ยืนยันการมอบหมายงาน</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                คุณต้องการมอบหมายงานซ่อม <strong>#REQ-{request.id.toString().padStart(4, '0')}</strong><br/>
                ให้กับช่างเทคนิคจำนวน <strong>{selectedTechs.length}</strong> คน ใช่หรือไม่?
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancelButton} 
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                ยกเลิก
              </button>
              <button 
                className={styles.modalConfirmButton} 
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'กำลังมอบหมาย...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TeamAssignment;
