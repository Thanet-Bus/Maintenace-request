import React, { useState, useEffect, useRef } from "react";
import styles from "./OnHoldReport.module.css";
import type { SubmitEvent } from "react";

interface OnHoldReportProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  onConfirm: (reason: string, notes: string, photo: File | null) => Promise<void>;
}

const OnHoldReport: React.FC<OnHoldReportProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  onConfirm,
}) => {
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reason || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason, notes, photo);
      onClose();
    } catch (error) {
      console.error("Failed to submit on hold report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className={`${styles.sheet} ${isOpen ? styles.sheetVisible : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>แจ้งพักงาน</h1>
        </header>

        <main className={styles.content}>
          {/* Job Info Card */}
          <section className={styles.jobInfoCard}>
            <div className={styles.jobInfoLabel}>
              <span className={styles.jobIdLabel}>Job ID</span>
              <span className={styles.jobIdValue}>
                #REQ-{jobId.toString().padStart(4, "0")}
              </span>
            </div>
            <h2 className={styles.jobTitle}>{jobTitle}</h2>
          </section>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            id="onHoldForm"
            className={styles.formSection}
          >
            <h3 className={styles.sectionLabel}>
              ระบุเหตุผลที่พักงาน (Select Reason)
            </h3>
            <div className={styles.radioGroup}>
              {[
                { value: "รออะไหล่", label: "รออะไหล่ (Waiting for Parts)" },
                {
                  value: "ต้องใช้เครื่องมือพิเศษ",
                  label: "ต้องใช้เครื่องมือพิเศษ (Special Tools Needed)",
                },
                { value: "หน้างานไม่พร้อม", label: "หน้างานไม่พร้อม (Site Not Ready)" },
                { value: "อื่น ๆ", label: "อื่น ๆ (Other)" },
              ].map((item) => (
                <label key={item.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={(e) => setReason(e.target.value)}
                    className={styles.radioInput}
                    required
                    disabled={isSubmitting}
                  />
                  <span className={styles.radioText}>{item.label}</span>
                </label>
              ))}
            </div>

            <section
              className={styles.formSection}
              style={{ marginTop: "1rem" }}
            >
              <label className={styles.sectionLabel} htmlFor="notes">
                รายละเอียดเพิ่มเติม (Additional Notes)
              </label>
              <textarea
                id="notes"
                className={styles.textarea}
                placeholder="ระบุรายละเอียดเพิ่มเติมที่นี่..."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
              ></textarea>
            </section>
            
            <section
              className={styles.formSection}
              style={{ marginTop: "1rem" }}
            >
              <h3 className={styles.sectionLabel}>
                อัปโหลดรูปภาพที่เกี่ยวข้อง (ถ้ามี)
              </h3>
              
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
                      alt="On Hold Context"
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
                      อัปโหลดรูปภาพที่อธิบายเหตุผลการพักงาน
                    </p>
                  </div>
                )}
              </div>
            </section>
          </form>
        </main>

        <div className={styles.bottomActions}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            form="onHoldForm"
            className={styles.confirmButton}
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการพักงาน"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnHoldReport;
