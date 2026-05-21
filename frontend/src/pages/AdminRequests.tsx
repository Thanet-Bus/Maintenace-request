import React from 'react';
import AdminLayout from '../components/AdminLayout';
import styles from './AdminRequests.module.css';

const AdminRequests: React.FC = () => {
  return (
    <AdminLayout>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>การจัดการใบแจ้งซ่อม</h1>
          <p className={styles.pageSubtitle}>Manage, assign, and track maintenance requests efficiently.</p>
        </div>
        <div className={styles.searchWrapper}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input 
            className={styles.searchInput} 
            placeholder="ค้นหา รหัส, หัวข้อ, สถานที่..." 
            type="text" 
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterLabel}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
          ตัวกรอง:
        </div>
        <select className={styles.filterSelect}>
          <option value="">สถานะทั้งหมด</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="active">กำลังดำเนินการ</option>
          <option value="completed">เสร็จสิ้น</option>
        </select>
        <select className={styles.filterSelect}>
          <option value="">ความเร่งด่วน</option>
          <option value="high">เร่งด่วน</option>
          <option value="normal">ปกติ</option>
        </select>
        <select className={styles.filterSelect}>
          <option value="">หมวดหมู่</option>
          <option value="ac">แอร์</option>
          <option value="electric">ไฟฟ้า</option>
          <option value="plumbing">ประปา</option>
        </select>
        <div className={styles.dateInputWrapper}>
          <span className={`material-symbols-outlined ${styles.dateIcon}`}>calendar_month</span>
          <input className={styles.dateInput} placeholder="ช่วงวันที่" type="text" />
        </div>
        <button className={styles.resetButton}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
          รีเซ็ต
        </button>
      </div>

      {/* Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>ID</th>
                <th>หัวข้อ / สถานที่</th>
                <th>ผู้แจ้ง</th>
                <th>หมวดหมู่</th>
                <th>สถานะ</th>
                <th>วันที่สร้าง</th>
                <th style={{ textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {/* Row 1 */}
              <tr className={styles.row}>
                <td>
                  <span className={styles.requestId}>#REQ-1002</span>
                </td>
                <td>
                  <div className={styles.issueInfo}>
                    <span className={styles.issueTitle}>แอร์ไม่เย็น มีน้ำหยด</span>
                    <div className={styles.issueLocation}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                      ห้องประชุม 1 (ชั้น 3)
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.requesterInfo}>
                    <div className={styles.smallAvatar}>
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPBIE0UYcHKHiKI_BRex_kBaEeRNvw8auHoh0ZeH_0n748bdkjuMo8koKJsSzYslT9WoqbKsDi3GiDjCRLlGyKgS1643NhccsKIDP6Fp9Zd8D4Wi3HlGiab2K410KCV-DbhbI5Ap9FO7BrjOVvl7Q1hMVGe4-tg6QEDmfVxhTjFoz92CjxizyiE95QZZvGQ0o51My1A0PYev-9IEjNvJ4uzeOa3SoKx8WkIha7b6dyNvI4ZvAqII0xf3D9C1ANlCWYuADy8410ckYD" 
                        alt="Requester" 
                      />
                    </div>
                    <span>คุณวิภาดา</span>
                  </div>
                </td>
                <td>
                  <div className={styles.categoryInfo}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>ac_unit</span>
                    แอร์
                  </div>
                </td>
                <td>
                  <div className={styles.statusGroup}>
                    <div className={styles.urgencyBadge}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', fontWeight: 'bold' }}>warning</span>
                      เร่งด่วน
                    </div>
                    <span className={styles.statusPill}>
                      <span className={styles.statusDot}></span>
                      รอดำเนินการ
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.dateInfo}>
                    12/05/2024<br />
                    <span className={styles.timeInfo}>10:30 AM</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className={styles.actionGroup}>
                    <button className={styles.editButton} title="แก้ไข">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                    </button>
                    <button className={styles.assignButton}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                      มอบหมายงาน
                    </button>
                  </div>
                </td>
              </tr>
              
              {/* Row 2 */}
              <tr className={styles.row}>
                <td>
                  <span className={styles.requestIdInactive}>#REQ-1001</span>
                </td>
                <td>
                  <div className={styles.issueInfo}>
                    <span className={styles.issueTitle}>หลอดไฟทางเดินขาด 2 ดวง</span>
                    <div className={styles.issueLocation}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                      โถงทางเดิน ชั้น 2
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.requesterInfo}>
                    <div className={`${styles.smallAvatar} ${styles.initialAvatar}`}>
                      ส
                    </div>
                    <span>สมชาย</span>
                  </div>
                </td>
                <td>
                  <div className={styles.categoryInfo}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lightbulb</span>
                    ไฟฟ้า
                  </div>
                </td>
                <td>
                  <div className={styles.statusGroup}>
                    <div className={styles.urgencyNormal}>
                      ปกติ
                    </div>
                    <span className={styles.statusPillInactive}>
                      <span className={styles.statusDotInactive}></span>
                      มอบหมายแล้ว
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.dateInfo}>
                    11/05/2024<br />
                    <span className={styles.timeInfo}>14:15 PM</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className={styles.actionGroup}>
                    <button className={styles.editButton} title="แก้ไข">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                    </button>
                    <button className={styles.detailButton}>
                      ดูรายละเอียด
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={styles.paginationFooter}>
          <span className={styles.pageInfo}>แสดง 1 ถึง 10 จาก 45 รายการ</span>
          <div className={styles.paginationActions}>
            <button className={styles.pageButton} disabled>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
            </button>
            <button className={`${styles.pageButton} ${styles.pageButtonActive}`}>1</button>
            <button className={styles.pageButton}>2</button>
            <button className={styles.pageButton}>3</button>
            <button className={styles.pageButton}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRequests;
