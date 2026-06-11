import React from "react";
import SignatureCanvas from 'react-signature-canvas' // third party plugin, might need to install for IDE sake
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import styles from "./JobCompletion.module.css";
import { useJobCompletion } from "../hooks/useJobCompletion";

const JobCompletion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    request,
    assignments,
    loading,
    summary,
    setSummary,
    ratings,
    isSubmitting,
    photoPreview,
    fileInputRef,
    canvasRef,
    hasSignature,
    setHasSignature,
    isSignatureConfirmed,
    handlePhotoChange,
    removePhoto,
    clearSignature,
    confirmSignature,
    handleRatingChange,
    handleCommentChange,
    isFormValid,
    handleSubmit
  } = useJobCompletion(id);

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
