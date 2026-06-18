import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { API_BASE_URL } from '../../config';
import styles from './AdminCompletedRequest.module.css';
import { getStatusBadge } from '../../utils/statusUtils';
import { useAdminCompletedRequest } from '../../hooks/admin/useAdminCompletedRequest';

const AdminCompletedRequest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { request, images, logs, reviews, loading, error } = useAdminCompletedRequest(id);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  if (loading) {
     return (
       <AdminLayout>
         <div className={styles.container}>
           <p style={{ textAlign: "center", marginTop: "40px" }}>กำลังโหลดข้อมูล...</p>
         </div>
       </AdminLayout>
     );
  }

  if (error || !request) {
     return (
       <AdminLayout>
         <div className={styles.container}>
           <p style={{ textAlign: 'center', marginTop: "40px", color: 'var(--color-error)' }}>
             {error || "ไม่พบข้อมูลรายการ"}
           </p>
            <div style={{ textAlign: 'center' }}>
              <button className={styles.backButton} onClick={() => navigate('/admin/requests')} style={{ margin: '0 auto' }}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>
          </div>
        </AdminLayout>
      );
    }

  // Group images by type
  const beforeImages = images.filter(img => img.image_type === 'REQUEST' || img.image_type === 'ON_HOLD');
  const afterImages = images.filter(img => img.image_type === 'COMPLETE');
  const signatureImages = images.filter(img => img.image_type === 'SIGNATURE');

  // Helper to resolve image URL
  const resolveImageUrl = (path: string) => {
      if (path.startsWith('http')) return path;
      return `${API_BASE_URL.replace(/\/api$/, "")}${path}`;
  };

  const handlePrint = () => {
    window.print();
  };

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
              รายละเอียดงานซ่อม (#REQ-{request.id.toString().padStart(4, "0")})
            </h2>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.headerBadge}>เสร็จสิ้น (COMPLETED)</span>
            <button className={styles.printButton} type="button" onClick={handlePrint}>
              <span className="material-symbols-outlined">print</span>
              พิมพ์ PDF
            </button>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Left Pane: Request Details */}
          <div className={styles.detailsPane}>
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
                      {request.description || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reviews */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  star
                </span>
                ผลการประเมิน
              </h3>
              {reviews.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>ยังไม่มีการประเมิน</p>
              ) : (
                <div className={styles.reviewsContainer}>
                  {reviews.map((review) => {
                    const tech = request.technicians?.find(t => t.id === review.technician_id);
                    return (
                      <div key={review.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewTechInfo}>
                            <span className={styles.reviewTechName}>
                              {tech?.name || `ช่าง ${review.technician_id}`}
                            </span>
                            {tech?.is_leader && <span className={styles.leaderBadgeSmall}>หัวหน้า</span>}
                          </div>
                          <div className={styles.starDisplay}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`material-symbols-outlined ${star <= review.rating ? styles.starFilled : styles.starEmpty}`}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className={styles.reviewComment}>{review.comment}</p>
                        )}
                        <p className={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
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

          {/* Right Pane: Completion Images */}
          <div className={styles.imagesPane}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--color-primary)" }}
                >
                  photo_library
                </span>
                รูปภาพการดำเนินการซ่อม
              </h3>

              <h4 className={styles.sectionTitle}>ภาพก่อนซ่อม ({beforeImages.length})</h4>
              {beforeImages.length > 0 ? (
                <div className={styles.photoGrid}>
                  {beforeImages.map((img) => (
                      <div 
                        key={img.id} 
                        className={styles.photoItem}
                        onClick={() => setSelectedImageUrl(resolveImageUrl(img.image_url))}
                      >
                        <img
                          src={resolveImageUrl(img.image_url)}
                          alt="Before repair"
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)" }}>ไม่มีรูปภาพ</p>
              )}

              <h4 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>ภาพหลังซ่อม ({afterImages.length})</h4>
              {afterImages.length > 0 ? (
                <div className={styles.photoGrid}>
                  {afterImages.map((img) => (
                      <div 
                        key={img.id} 
                        className={styles.photoItem}
                        onClick={() => setSelectedImageUrl(resolveImageUrl(img.image_url))}
                      >
                        <img
                          src={resolveImageUrl(img.image_url)}
                          alt="After repair"
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)" }}>ไม่มีรูปภาพ</p>
              )}

              <h4 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>ลายเซ็นผู้รับงาน ({signatureImages.length})</h4>
              {signatureImages.length > 0 ? (
                <div className={styles.photoGrid}>
                  {signatureImages.map((img) => (
                      <div 
                        key={img.id} 
                        className={`${styles.photoItem} ${styles.signature}`}
                        onClick={() => setSelectedImageUrl(resolveImageUrl(img.image_url))}
                      >
                        <img
                          src={resolveImageUrl(img.image_url)}
                          alt="Signature"
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)" }}>ไม่มีรูปลายเซ็น</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Overlay Modal */}
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

export default AdminCompletedRequest;
