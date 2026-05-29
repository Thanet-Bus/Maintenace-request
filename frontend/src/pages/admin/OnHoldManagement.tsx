import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import styles from "./OnHoldManagement.module.css";
import { API_BASE_URL } from "../../config";
import type { RepairRequest, RepairLog } from "../../types/types";

// Dummy list of technicians for the selection (consistent with TeamAssignment)
const dummyTechnicians = [
  {
    id: 101,
    name: "กฤษณะ แอร์เย็น",
    desc: "ผู้เชี่ยวชาญระบบปรับอากาศ (คิวว่าง)",
    busy: false,
  },
  { id: 102, name: "วิชาญ งานไว", desc: "ช่างทั่วไป (คิวว่าง)", busy: false },
  {
    id: 103,
    name: "ทวีศักดิ์ ไฟฟ้า",
    desc: "ติดงานซ่อมอาคาร B (ถึง 15:00)",
    busy: true,
  },
];

const OnHoldManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("");
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

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadInitialData() {
      try {
        await Promise.all([fetchRequestDetails(), fetchLogs()]);
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
  }, [id, fetchRequestDetails, fetchLogs]);

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !appointmentDate || !appointmentTime) return;

    setSubmitting(true);
    try {
      const isoDateTime = new Date(
        `${appointmentDate}T${appointmentTime}:00`,
      ).toISOString();

      // 1. Update Request appointment date
      const patchRes = await fetch(`${API_BASE_URL}/repair-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_date: isoDateTime,
          status: "ASSIGNED", // Move back to Assigned when rescheduled
          note: `แอดมินกำหนดวันนัดหมายใหม่: ${appointmentDate} ${appointmentTime}`,
        }),
      });

      if (!patchRes.ok) throw new Error("Failed to update request");

      // 2. If a new technician was selected, update assignments
      if (selectedTech) {
        await fetch(`${API_BASE_URL}/assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repair_request_id: parseInt(id, 10),
            appointment_date: isoDateTime,
            technicians: [
              {
                technician_id: parseInt(selectedTech, 10),
                is_leader: true,
              },
            ],
          }),
        });
      }

      alert("บันทึกการนัดหมายใหม่สำเร็จ");
      navigate("/admin/requests");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminate = async () => {
    if (!id || !window.confirm("คุณต้องการยกเลิกคำร้องนี้ใช่หรือไม่?")) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/repair-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          note: note || "แอดมินยกเลิกรายการ",
        }),
      });
      if (!res.ok) throw new Error("Failed to cancel request");

      alert("ยกเลิกรายการสำเร็จ");
      navigate("/admin/requests");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
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
                  ? new Date(onHoldLog.created_at).toLocaleString("th-TH")
                  : "-"}
              </p>
              <p
                style={{
                  fontSize: "15px",
                  // color: "var(--color-outline)",
                  // marginTop: "0.25rem",
                }}
              >
                วันเวลานัดหมายเดิม:{" "}
                {request.appointment_date
                  ? new Date(request.appointment_date).toLocaleString("th-TH")
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

              <form className={styles.form} onSubmit={handleReschedule}>
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
                  <label className={styles.fieldLabel}>
                    มอบหมายช่างใหม่ (ไม่บังคับ)
                  </label>
                  <select
                    className={styles.select}
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                  >
                    <option value="">-- ใช้ทีมเดิม --</option>
                    {dummyTechnicians.map((t) => (
                      <option key={t.id} value={t.id} disabled={t.busy}>
                        {t.name} {t.busy ? "(ติดงาน)" : "(ว่าง)"}
                      </option>
                    ))}
                  </select>
                </div>

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
                  onClick={handleTerminate}
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
    </AdminLayout>
  );
};

export default OnHoldManagement;
