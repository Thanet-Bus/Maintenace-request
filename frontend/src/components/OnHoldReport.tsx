import React, { useState, useEffect } from "react";
import styles from "./OnHoldReport.module.css";
import type { SubmitEvent } from "react";

interface OnHoldReportProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  onConfirm: (reason: string, notes: string) => Promise<void>;
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reason || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason, notes);
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
          </form>
        </main>

        <div className={styles.bottomActions}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
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
