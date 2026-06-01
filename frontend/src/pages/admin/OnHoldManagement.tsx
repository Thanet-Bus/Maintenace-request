import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import styles from "./OnHoldManagement.module.css";
import { API_BASE_URL } from "../../config";
import type { RepairRequest, RepairLog } from "../../types/types";

type Technician = {
  id: number;
  name: string;
  phone?: string | null;
  profile_image_url?: string | null;
};

const OnHoldManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom Alert / Modal State
  const [errorMessage, setErrorMessage] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  // Form State
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<number[]>([]);
  const [leaderId, setLeaderId] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const fetchRequestDetails = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`${API_BASE_URL}/repair-requests/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch request");
    }
    const data = await res.json();
    setRequest(data);
    if (data.appointment_date) {
      const dateObj = new Date(data.appointment_date);
      setAppointmentDate(dateObj.toISOString().split("T")[0]);
      setAppointmentTime(dateObj.toTimeString().slice(0, 5));
    }
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

  const fetchTechnicians = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/technicians`);
      if (!res.ok) throw new Error("Failed to fetch technicians");
      const data = await res.json();
      setTechnicians(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadInitialData() {
      try {
        await Promise.all([
          fetchRequestDetails(), 
          fetchLogs(),
          fetchTechnicians()
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
  }, [id, fetchRequestDetails, fetchLogs, fetchTechnicians]);

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

  const handlePreReschedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    if (!id || !appointmentDate || !appointmentTime) {
      setErrorMessage("กรุณาระบุวันและเวลาที่นัดหมายใหม่");
      return;
    }
    setIsRescheduleModalOpen(true);
  };

  const executeReschedule = async () => {
    if (!id || !appointmentDate || !appointmentTime) return;

    // Ensure we have a leader if techs are selected
    const finalLeaderId = leaderId || (selectedTechs.length > 0 ? selectedTechs[0] : null);

    setSubmitting(true);
    try {
      const isoDateTime = new Date(
        `${appointmentDate}T${appointmentTime}:00+07:00`,
      ).toISOString();

      // 1. Update Request appointment date
      const patchRes = await fetch(`${API_BASE_URL}/repair-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_date: isoDateTime,
          status: "ASSIGNED", // Move back to Assigned when rescheduled
          note: `แอดมินกำหนดวันนัดหมายใหม่: ${appointmentDate} ${appointmentTime} น.`,
        }),
      });

      if (!patchRes.ok) throw new Error("Failed to update request");

      // 2. If technicians were selected, update assignments
      if (selectedTechs.length > 0) {
        await fetch(`${API_BASE_URL}/assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repair_request_id: parseInt(id, 10),
            appointment_date: isoDateTime,
            technicians: selectedTechs.map(techId => ({
              technician_id: techId,
              is_leader: techId === finalLeaderId
            })),
          }),
        });
      }

      navigate("/admin/requests");
    } catch (err) {
      console.error(err);
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูลการนัดหมาย");
      setIsRescheduleModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminateClick = () => {
    setErrorMessage("");
    if (!note.trim()) {
      setErrorMessage("กรุณาระบุเหตุผลในการยกเลิกใบแจ้งซ่อม");
      return;
    }
    setIsCancelModalOpen(true);
  };

  const executeTerminate = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/repair-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          note: note,
        }),
      });
      if (!res.ok) throw new Error("Failed to cancel request");

      navigate("/admin/requests");
    } catch (err) {
      console.error(err);
      setErrorMessage("เกิดข้อผิดพลาดในการยกเลิกรายการ");
      setIsCancelModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.container}>
          <p style={{ textAlign: "center", marginTop: "40px" }}>กำลังโหลด...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!request) return null;

  const onHoldLog = logs.find((log) => log.status_to === "ON_HOLD");

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <button
              className={styles.backButton}
              onClick={() => navigate("/admin/requests")}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className={styles.pageTitle}>
              จัดการงานที่พักไว้ (#REQ-{request.id.toString().padStart(4, "0")})
            </h2>
          </div>
          <span className={styles.headerBadge}>พักงานซ่อม (ON HOLD)</span>
        </div>

        <div className={styles.mainGrid}>
          {/* Left Pane: Request & On-Hold Details */}
          <div className={styles.detailsPane}>
            <div className={`${styles.card} ${styles.onHoldCard}`}>
              <h3 className={styles.cardTitle}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-status-onhold)" }}
                >
                  pause_circle
                </span>
                เหตุผลที่พักงาน
              </h3>
              <div className={styles.reasonBox}>
                <div className={styles.reasonTitle}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    error_outline
                  </span>
                  รายละเอียดจากช่าง:
                </div>
                <p className={styles.reasonText}>
                  {onHoldLog?.note || "ไม่ได้ระบุเหตุผล"}
                </p>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-outline)",
                  marginTop: "1rem",
                }}
              >
                วันที่พักงาน:{" "}
                {onHoldLog
                  ? new Date(onHoldLog.created_at).toLocaleString("th-TH") + ' น.'
                  : "-"}
              </p>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginTop: "0.5rem",
                }}
              >
                วันเวลานัดหมายเดิม:{" "}
                {request.appointment_date
                  ? new Date(request.appointment_date).toLocaleString("th-TH") + ' น.'
                  : "-"}
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  info
                </span>
                ข้อมูลคำร้อง
              </h3>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className={styles.infoLabel}>ผู้แจ้งซ่อม</p>
                    <p className={styles.infoValue}>
                      User {request.requester_id}
                    </p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <span className="material-symbols-outlined">
                      location_on
                    </span>
                  </div>
                  <div>
                    <p className={styles.infoLabel}>สถานที่</p>
                    <p className={styles.infoValue}>{request.location}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <span className="material-symbols-outlined">
                      description
                    </span>
                  </div>
                  <div>
                    <p className={styles.infoLabel}>หัวข้อ / รายละเอียด</p>
                    <p className={styles.infoValue}>{request.title}</p>
                    <p style={{ fontSize: "14px", marginTop: "4px" }}>
                      {request.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Action Form */}
          <div className={styles.formPane}>
            <div className={`${styles.card} ${styles.accentCard}`}>
              <div className={styles.accentBar}></div>
              <h3 className={styles.cardTitle}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  event_repeat
                </span>
                กำหนดวันนัดหมายใหม่ (Reschedule)
              </h3>

              <form className={styles.form} onSubmit={handlePreReschedule}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    วันเวลาที่นัดหมายใหม่{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputGrid}>
                    <div className={styles.inputWithIcon}>
                      <span
                        className={`material-symbols-outlined ${styles.prefixIcon}`}
                      >
                        calendar_today
                      </span>
                      <input
                        className={styles.input}
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputWithIcon}>
                      <span
                        className={`material-symbols-outlined ${styles.prefixIcon}`}
                      >
                        schedule
                      </span>
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

                <div className={styles.fieldGroup}>
                  <div className={styles.fieldHeader}>
                    <label className={styles.fieldLabel}>มอบหมายช่างใหม่ (ถ้ามี)</label>
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
                                /> หัวหน้าทีม
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
                                /> ผู้ช่วย
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && !isCancelModalOpen && !isRescheduleModalOpen && (
                  <div style={{ color: 'var(--color-error)', fontSize: '14px', marginTop: '0.5rem', marginBottom: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--color-error-container)', borderRadius: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>error</span>
                    {errorMessage}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    className={styles.confirmButton}
                    type="submit"
                    disabled={submitting}
                  >
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                    {submitting ? "กำลังบันทึก..." : "ยืนยันการนัดหมายใหม่"}
                  </button>
                </div>
              </form>
            </div>

            {/* Action Card: Cancel */}
            <div className={styles.terminateCard}>
              <div className={styles.terminateHeader}>
                <span className="material-symbols-outlined" style={{ color: "var(--color-error)" }}>cancel</span>
                <h3 className={styles.terminateTitle}>ยกเลิกงาน (Cancel)</h3>
              </div>
              
              <form className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    เหตุผลการยกเลิก
                  </label>
                  <textarea
                    className={styles.cancelTextarea}
                    placeholder="โปรดระบุเหตุผลที่ต้องยกเลิกใบแจ้งซ่อมนี้..."
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>
                <button
                  className={styles.terminateButton}
                  onClick={handleTerminateClick}
                  disabled={submitting}
                  type="button"
                >
                  ยกเลิกใบแจ้งซ่อม
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reschedule */}
      {isRescheduleModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !submitting && setIsRescheduleModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={`material-symbols-outlined ${styles.modalIcon}`}>calendar_clock</span>
              <h3 className={styles.modalTitle}>ยืนยันการนัดหมายใหม่</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                คุณต้องการยืนยันการนัดหมายเข้าซ่อมใหม่ในวันที่ <strong>{new Date(appointmentDate).toLocaleDateString('th-TH')}</strong> เวลา <strong>{appointmentTime} น.</strong> สำหรับคำร้อง <strong>#REQ-{request.id.toString().padStart(4, '0')}</strong> ใช่หรือไม่?
              </p>
              {selectedTechs.length > 0 && (
                <p className={styles.modalText} style={{ marginTop: '0.5rem' }}>
                  โดยมอบหมายทีมช่างใหม่จำนวน <strong>{selectedTechs.length}</strong> คน
                </p>
              )}
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
                onClick={() => setIsRescheduleModalOpen(false)}
                disabled={submitting}
              >
                ย้อนกลับ
              </button>
              <button 
                className={styles.modalConfirmButton} 
                onClick={executeReschedule}
                disabled={submitting}
              >
                {submitting ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Termination */}
      {isCancelModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !submitting && setIsCancelModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={`material-symbols-outlined ${styles.modalIcon}`} style={{ color: 'var(--color-error)' }}>warning</span>
              <h3 className={styles.modalTitle}>ยืนยันการยกเลิกใบแจ้งซ่อม</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                คุณต้องการยกเลิกคำร้อง <strong>#REQ-{request.id.toString().padStart(4, '0')}</strong> ใช่หรือไม่?<br/>
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
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
                onClick={() => setIsCancelModalOpen(false)}
                disabled={submitting}
              >
                ย้อนกลับ
              </button>
              <button 
                className={styles.modalConfirmButton} 
                style={{ backgroundColor: 'var(--color-error)' }}
                onClick={executeTerminate}
                disabled={submitting}
              >
                {submitting ? 'กำลังยกเลิก...' : 'ยืนยันการยกเลิก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OnHoldManagement;
