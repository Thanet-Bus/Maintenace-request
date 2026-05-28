import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import type {
  RepairRequest,
  AssignmentDetail,
  AssignmentResponse,
} from "../types/types";
import styles from "./JobCompletion.module.css";
import { API_BASE_URL } from "../config";

interface TechnicianRating {
  technician_id: number;
  rating: number;
  comment: string;
}

const JobCompletion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [summary, setSummary] = useState("");
  const [ratings, setRatings] = useState<Record<number, TechnicianRating>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [photos, setPhotos] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSignatureConfirmed, setIsSignatureConfirmed] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`${API_BASE_URL}/repair-requests/${id}`);
    if (!res.ok) throw new Error("Failed to fetch request");
    const data = await res.json();
    setRequest(data);
  }, [id]);

  const fetchAssignments = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`${API_BASE_URL}/assignments/repair-request/${id}`);
    if (!res.ok) throw new Error("Failed to fetch assignments");
    const data: AssignmentResponse = await res.json();
    setAssignments(data.technicians);

    // Initialize ratings state
    const initialRatings: Record<number, TechnicianRating> = {};
    data.technicians.forEach((tech) => {
      initialRatings[tech.technician_id] = {
        technician_id: tech.technician_id,
        rating: 0,
        comment: "",
      };
    });
    setRatings(initialRatings);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadData() {
      try {
        await Promise.all([fetchRequestDetails(), fetchAssignments()]);
      } catch (err) {
        if (!cancelled) console.error("Error loading data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id, fetchRequestDetails, fetchAssignments]);

  // Signature Canvas Logic
  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Prevent scrolling while drawing on mobile
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setIsSignatureConfirmed(false);
  };

  const confirmSignature = () => {
    if (hasSignature) {
      setIsSignatureConfirmed(true);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";
      }
    }
  }, [loading]);

  const handleRatingChange = (techId: number, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [techId]: { ...prev[techId], rating },
    }));
  };

  const handleCommentChange = (techId: number, comment: string) => {
    setRatings((prev) => ({
      ...prev,
      [techId]: { ...prev[techId], comment },
    }));
  };

  const isFormValid = summary.trim() !== "" && isSignatureConfirmed;

  const handleSubmit = async () => {
    if (!isFormValid || !id) return;

    setIsSubmitting(true);
    try {
      // 1. Update Request Status to COMPLETED
      const statusRes = await fetch(`${API_BASE_URL}/repair-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          note: `ปิดงาน: ${summary}`,
        }),
      });

      if (!statusRes.ok) throw new Error("Failed to complete job");

      // (In a real app, you would also submit the signature image, photos, and ratings here)

      navigate("/tasks", { replace: true });
    } catch (error) {
      console.error("Error completing job:", error);
      alert("เกิดข้อผิดพลาดในการปิดงาน กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="ปิดงานซ่อม" showBackButton>
        <div className={styles.container}>
          <p style={{ textAlign: "center", marginTop: "40px" }}>กำลังโหลด...</p>
        </div>
      </Layout>
    );
  }

  if (!request) return null;

  return (
    <Layout
      title={`ปิดงานซ่อม (#REQ-${request.id.toString().padStart(4, "0")})`}
      showBackButton
      showBottomNav={false}
    >
      <div
        className={`${styles.container} ${isSubmitting ? styles.submitting : ""}`}
      >
        {/* Step 1: Photos */}
        <section className={styles.section}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>1</div>
            <h2 className={styles.stepTitle}>อัปโหลดรูปภาพหลังซ่อม</h2>
          </div>

          <div className={styles.uploadArea}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "36px", color: "var(--color-primary)" }}
            >
              add_a_photo
            </span>
            <p className={styles.uploadText}>แตะเพื่อถ่ายรูปหรือเลือกรูปภาพ</p>
            <p className={styles.uploadSubtext}>
              อัปโหลดรูปภาพความละเอียดสูงเพื่อยืนยันการซ่อมแซม
            </p>
          </div>
        </section>

        {/* Step 2: Summary */}
        <section className={styles.section}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>2</div>
            <h2 className={styles.stepTitle}>สรุปผลการดำเนินงาน</h2>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="summary">
              รายละเอียดการซ่อมแซม
            </label>
            <textarea
              id="summary"
              className={styles.textarea}
              placeholder="ระบุสิ่งที่ได้ดำเนินการแก้ไข..."
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>
        </section>

        {/* Step 3: Customer Ratings */}
        <section className={styles.section}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>3</div>
            <h2 className={styles.stepTitle}>ส่วนสำหรับลูกค้าประเมินผล</h2>
          </div>
          <p className={styles.infoText}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "16px",
                marginRight: "4px",
                verticalAlign: "text-bottom",
              }}
            >
              info
            </span>
            โปรดให้ลูกค้าเป็นผู้ประเมินความพึงพอใจการให้บริการของช่าง
          </p>

          <div className={styles.techniciansList}>
            {assignments.map((tech) => (
              <div key={tech.technician_id} className={styles.techCard}>
                <div className={styles.techHeader}>
                  <div className={styles.techAvatar}>
                    <img
                      src={
                        tech.is_leader
                          ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDUZ7iULgAMP6dKL_DqVDPds7OJ50FFD5IctlX8TWg6j1hb3VQ1vJch6F4a5Fi-MjdEDYZLU8NVSxs9SS_4KPQe8KE0WQsUykE5v-DrJnDuHgmt166WbFCfknyPiZSfsCIy-STkqR47fxUDhx9bD9y9Zfv0vIE8oDJa4z4yUTVeOC0PYdZvb_kzmYTQGRAfunQOL6KVnZityhTkgbOmdIzE-aTGkVv3D0HjvVLLfCpi8ftaSXMFLENCqoYwoCNIbArGbJAWwXunlwj0"
                          : "https://lh3.googleusercontent.com/aida-public/AB6AXuDv_yiorjYzWFH3zNQvWbU-zz-bc6Eo0cnrnayY2fCXWJWMQo7au5MVEHAHD9XnZ78u_i_-l_x3fGggWfJzUsFDAwe1rYZe5dNmtKCWyY2BCqbpWEn4LEOjYwDCySWxg7kJurYEJjxbF8PysPjeKQJVHEP5ZQ45VU1NAQwDax4hPnWOn-fYHAJ-clGLMWvIFtOacJRVm5XlJtxVAkF_H0Byez-2_MFBbcP8bVCD9-QluqvmLldN2PPtC2dJzRE4PCOZNdZOevn0g78-"
                      }
                      alt="Tech"
                    />
                  </div>
                  <div>
                    <h3 className={styles.techName}>
                      {tech.technician_name ||
                        `ช่างเทคนิค ID: ${tech.technician_id}`}
                    </h3>
                    <span className={styles.techRoleBadge}>
                      {tech.is_leader ? "Leader" : "Assistant"}
                    </span>
                  </div>
                </div>

                <div className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${styles.starBtn} ${(ratings[tech.technician_id]?.rating || 0) >= star ? styles.starActive : ""}`}
                      onClick={() =>
                        handleRatingChange(tech.technician_id, star)
                      }
                      disabled={isSubmitting}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontVariationSettings:
                            (ratings[tech.technician_id]?.rating || 0) >= star
                              ? '"FILL" 1'
                              : '"FILL" 0',
                        }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className={styles.commentInput}
                  placeholder="ความคิดเห็นเพิ่มเติม (ถ้ามี)"
                  value={ratings[tech.technician_id]?.comment || ""}
                  onChange={(e) =>
                    handleCommentChange(tech.technician_id, e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Step 4: Signature */}
        <section className={styles.section}>
          <div className={styles.stepHeader}>
            <div className={styles.stepNumber}>4</div>
            <h2 className={styles.stepTitle}>ลงชื่อผู้รับงาน</h2>
          </div>
          <p className={styles.subLabel}>
            กรุณาให้ลูกค้าเซ็นชื่อเพื่อยืนยันการรับมอบงาน
          </p>

          <div className={styles.signatureArea}>
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              className={`${styles.canvas} ${isSignatureConfirmed ? styles.canvasConfirmed : ""}`}
              onMouseDown={isSignatureConfirmed ? undefined : startDrawing}
              onMouseMove={isSignatureConfirmed ? undefined : draw}
              onMouseUp={isSignatureConfirmed ? undefined : stopDrawing}
              onMouseLeave={isSignatureConfirmed ? undefined : stopDrawing}
              onTouchStart={isSignatureConfirmed ? undefined : startDrawing}
              onTouchMove={isSignatureConfirmed ? undefined : draw}
              onTouchEnd={isSignatureConfirmed ? undefined : stopDrawing}
              style={{ touchAction: "none" }} // Prevent scrolling while signing
            />
            {!hasSignature && (
              <div className={styles.signaturePlaceholder}>
                <span>พื้นที่สำหรับเซ็นชื่อ</span>
              </div>
            )}
          </div>

          <div className={styles.signatureActions}>
            <button
              className={styles.clearBtn}
              onClick={clearSignature}
              disabled={isSubmitting || !hasSignature}
            >
              ล้างลายเซ็น
            </button>
            <button
              className={styles.confirmSigBtn}
              onClick={confirmSignature}
              disabled={isSubmitting || !hasSignature || isSignatureConfirmed}
            >
              {isSignatureConfirmed ? (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "18px",
                      marginRight: "4px",
                      verticalAlign: "text-bottom",
                    }}
                  >
                    check_circle
                  </span>
                  ยืนยันลายเซ็นแล้ว
                </>
              ) : (
                "ยืนยันลายเซ็น"
              )}
            </button>
          </div>
        </section>

        {/* Submit */}
        <div className={styles.submitArea}>
          <button
            className={`${styles.submitBtn} ${isFormValid ? styles.submitBtnValid : ""}`}
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการส่งงาน"}
          </button>
          {!isFormValid && (
            <p className={styles.errorText}>
              {summary.trim() === ""
                ? "กรุณากรอกรายละเอียดการซ่อม"
                : "กรุณาเซ็นชื่อและกดยืนยันลายเซ็น"}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobCompletion;
