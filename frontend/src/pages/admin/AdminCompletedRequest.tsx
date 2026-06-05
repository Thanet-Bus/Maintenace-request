import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { API_BASE_URL } from '../../config';
import type { RepairRequest, RepairImage, RepairLog } from '../../types/types';
import styles from './AdminCompletedRequest.module.css';
import { getStatusBadge } from '../../utils/statusUtils';

const AdminCompletedRequest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [images, setImages] = useState<RepairImage[]>([]);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const fetchRequestData = useCallback(() => {
    if (!id) return;
    setLoading(true);
    
    Promise.all([
      fetch(`${API_BASE_URL}/repair-requests/${id}`).then(res => {
        if (!res.ok) throw new Error("Failed to fetch request details");
        return res.json();
      }),
      fetch(`${API_BASE_URL}/repair-images/repair-request/${id}`).then(res => {
        if (!res.ok) return []; // Ignore errors, return empty
        return res.json();
      }),
      fetch(`${API_BASE_URL}/logs/request/${id}`).then(res => {
        if (!res.ok) return []; // Ignore errors, return empty
        return res.json();
      })
    ])
    .then(([reqData, imgsData, logsData]) => {
      setRequest(reqData);
      setImages(imgsData);
      setLogs(logsData);
    })
    .catch(err => {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
        if (!isMounted) return;
        await fetchRequestData();
    };
    
    loadData();

    return () => {
        isMounted = false;
    };
  }, [fetchRequestData]);

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
  const beforeImages = images.filter(img => img.image_type === 'REQUEST');
  const afterImages = images.filter(img => img.image_type === 'COMPLETE');
  const signatureImages = images.filter(img => img.image_type === 'SIGNATURE');

  // Helper to resolve image URL
  const resolveImageUrl = (path: string) => {
      if (path.startsWith('http')) return path;
      return `${API_BASE_URL.replace(/\/api$/, "")}${path}`;
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
          <span className={styles.headerBadge}>เสร็จสิ้น (COMPLETED)</span>
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
