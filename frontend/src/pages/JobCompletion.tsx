import React, { useState, useRef, useEffect, useCallback } from "react";
import SignatureCanvas from 'react-signature-canvas' // third party plugin, might need to install for IDE sake
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
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<SignatureCanvas>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSignatureConfirmed, setIsSignatureConfirmed] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);
      setPhotoPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

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

    window.scrollTo(0, 0);

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

  const clearSignature = () => {
    canvasRef.current?.clear();
    setHasSignature(false);
    setIsSignatureConfirmed(false);
  };

  const confirmSignature = () => {
    if (canvasRef.current && !canvasRef.current.isEmpty()) {
      setIsSignatureConfirmed(true);
    }
  };

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
    
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);

    try {
      // 1. Update Request Status to COMPLETED
      const statusRes = await fetch(`${API_BASE_URL}/repair-requests/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "COMPLETED",
          note: `ปิดงาน: ${summary}`,
        }),
      });

      if (!statusRes.ok) throw new Error("Failed to complete job");

      // 2. Upload COMPLETE photo if available
      if (photo) {
        const formData = new FormData();
        formData.append("repair_request_id", id.toString());
        formData.append("image_type", "COMPLETE");
        formData.append("uploaded_by", user.id.toString());
        formData.append("file", photo);

        const photoRes = await fetch(`${API_BASE_URL}/repair-images`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData,
        });
        if (!photoRes.ok) console.warn("Failed to upload complete photo");
      }

      // 3. Upload SIGNATURE image
      if (canvasRef.current && hasSignature) {
        const canvas = canvasRef.current.getCanvas();
        const signatureBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png");
        });

        if (signatureBlob) {
          const signatureFile = new File([signatureBlob], "signature.png", { type: "image/png" });
          const sigFormData = new FormData();
          sigFormData.append("repair_request_id", id.toString());
          sigFormData.append("image_type", "SIGNATURE");
          sigFormData.append("uploaded_by", user.id.toString());
          sigFormData.append("file", signatureFile);

          const sigRes = await fetch(`${API_BASE_URL}/repair-images`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: sigFormData,
          });
          if (!sigRes.ok) console.warn("Failed to upload signature");
        }
      }

      // 4. Submit ratings to the review API
      const reviewPromises = Object.values(ratings)
        .filter((r) => r.rating > 0)
        .map((r) =>
          fetch(`${API_BASE_URL}/reviews`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              repair_request_id: parseInt(id),
              technician_id: r.technician_id,
              rating: r.rating,
              comment: r.comment || null,
            }),
          })
        );

      if (reviewPromises.length > 0) {
        const reviewResults = await Promise.all(reviewPromises);
        reviewResults.forEach((res, index) => {
          if (!res.ok) console.warn(`Failed to submit review for tech index ${index}`);
        });
      }

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
          <p className={styles.loadingText}>กำลังโหลด...</p>
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

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            className={styles.hiddenInput}
            onChange={handlePhotoChange}
          />

          <div className={styles.uploadArea}>
            {photoPreview ? (
              <div className={styles.photoPreviewContainer}>
                <img
                  src={photoPreview}
                  alt="After repair"
                  className={styles.photoPreviewImage}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className={styles.removePhotoBtn}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <div className={styles.uploadAreaInner} onClick={() => fileInputRef.current?.click()}>
                <span
                  className={`material-symbols-outlined ${styles.uploadIcon}`}
                >
                  add_a_photo
                </span>
                <p className={styles.uploadText}>แตะเพื่อถ่ายรูปหรือเลือกรูปภาพ</p>
                <p className={styles.uploadSubtext}>
                  อัปโหลดรูปภาพความละเอียดสูงเพื่อยืนยันการซ่อมแซม
                </p>
              </div>
            )}
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
              className={`material-symbols-outlined ${styles.infoIcon}`}
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
                      {tech.is_leader ? "หัวหน้า" : "ผู้ช่วย"}
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
                        className={`material-symbols-outlined ${(ratings[tech.technician_id]?.rating || 0) >= star ? styles.starIconFilled : styles.starIconEmpty}`}
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
            <div className={`${styles.canvas} ${isSignatureConfirmed ? styles.canvasConfirmed : ""}`}>
              <SignatureCanvas
                ref={canvasRef}
                canvasProps={{
                  width: 350,
                  height: 200,
                  className: styles.sigCanvas,
                }}
                onEnd={() => setHasSignature(true)}
              />
            </div>
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
                    className={`material-symbols-outlined ${styles.confirmIcon}`}
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
