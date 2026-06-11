import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import styles from "./OnHoldManagement.module.css";
import { API_BASE_URL, generateTimeOptions } from "../../config";
import { getStatusBadge } from "../../utils/statusUtils";
import { useOnHoldManagement } from "../../hooks/admin/useOnHoldManagement";

const timeOptions = generateTimeOptions("07:00", "19:00", 30);

const OnHoldManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    request,
    logs,
    technicians,
    assignedTechs,
    images,
    loading,
    submitting,
    appointmentDate, setAppointmentDate,
    appointmentTime, setAppointmentTime,
    selectedTechs,
    leaderId, setLeaderId,
    note, setNote,
    handleTechToggle,
    isInvalidTime,
    executeReschedule,
    executeTerminate
  } = useOnHoldManagement(id);

  // Custom Alert / Modal State
  const [errorMessage, setErrorMessage] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handlePreReschedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    if (!id || !appointmentDate || !appointmentTime) {
      setErrorMessage("กรุณาระบุวันและเวลาที่นัดหมายใหม่");
      return;
    }

    if (isInvalidTime()) {
      setErrorMessage("เวลาที่นัดหมายใหม่ต้องมากกว่าเวลาเดิม");
      return;
    }

    setIsRescheduleModalOpen(true);
  };

  const handleExecuteReschedule = () => {
    executeReschedule(
      () => {},
      () => {
        setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูลการนัดหมาย");
        setIsRescheduleModalOpen(false);
      }
    );
  };

  const handleTerminateClick = () => {
    setErrorMessage("");
    if (!note.trim()) {
      setErrorMessage("กรุณาระบุเหตุผลในการยกเลิกใบแจ้งซ่อม");
      return;
    }
    setIsCancelModalOpen(true);
  };

  const handleExecuteTerminate = () => {
    executeTerminate(
      () => {},
      () => {
        setErrorMessage("เกิดข้อผิดพลาดในการยกเลิกรายการ");
        setIsCancelModalOpen(false);
      }
    );
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
                  ? new Date(request.appointment_date).toLocaleString("th-TH", {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) + ' น.'
                  : "-"}
              </p>
            </div>

            {assignedTechs.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "var(--color-primary)" }}
                  >
                    engineering
                  </span>
                  ช่างที่ได้รับมอบหมาย
                </h3>
                <div className={styles.techList}>
                  {assignedTechs.map((tech) => (
                    <div key={tech.id} className={styles.techItem}>
                      <div className={styles.techMainInfo}>
                        {tech.profile_image_url ? (
                          <img className={styles.techAvatar} src={tech.profile_image_url} alt={tech.technician_name || 'ช่างเทคนิค'} />
                        ) : (
                          <div className={styles.initialAvatar}>{tech.technician_name?.charAt(0) || '?'}</div>
                        )}
                        <div>
                          <p className={styles.techName}>
                            {tech.technician_name || `ช่างเทคนิค ID: ${tech.technician_id}`} {tech.is_leader && <span style={{ fontSize: "12px", color: "var(--color-primary)" }}>(หัวหน้าทีม)</span>}
                          </p>
                          {tech.phone && <p className={styles.techDesc}>{tech.phone}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Request Images */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  photo_library
                </span>
                รูปภาพประกอบ
              </h3>
              {images.length > 0 ? (
                <div className={styles.photoGrid}>
                  {images
                    .filter((img) => img.image_type === "REQUEST" || img.image_type === "ON_HOLD")
                    .map((image) => (
                      <div 
                        key={image.id} 
                        className={styles.photoItem}
                        onClick={() => setSelectedImageUrl(`${API_BASE_URL.replace(/\/api$/, "")}${image.image_url}`)}
                      >
                        <img
                          src={`${API_BASE_URL.replace(/\/api$/, "")}${image.image_url}`}
                          alt="Request image"
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "14px",
                    textAlign: "center",
                    color: "var(--color-on-surface-variant)",
                    marginTop: "0.5rem",
                  }}
                >
                  ไม่มีรูปภาพประกอบ
                </p>
              )}
            </div>

            {/* Request Logs */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  history
                </span>
                ประวัติการดำเนินการ
              </h3>
              {logs.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>ไม่พบประวัติการดำเนินการ</p>
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
                            <span className={styles.logTime}>
                              {new Date(log.created_at).toLocaleString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'Asia/Bangkok'
                              })} น.
                            </span>
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
                         min={request.appointment_date ? new Date(request.appointment_date).toISOString().split("T")[0] : undefined}
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
                      <select
                        className={styles.input}
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        required
                      >
                        <option value="">เลือกเวลา</option>

                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isInvalidTime() && (
                    <span style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '8px', display: 'block' }}>
                      เวลาที่นัดหมายใหม่ต้องมากกว่าเวลาเดิม
                    </span>
                  )}
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
                    disabled={submitting || isInvalidTime()}
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
                onClick={handleExecuteReschedule}
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
                onClick={handleExecuteTerminate}
                disabled={submitting}
              >
                {submitting ? 'กำลังยกเลิก...' : 'ยืนยันการยกเลิก'}
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

export default OnHoldManagement;
