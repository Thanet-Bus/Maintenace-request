import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import styles from './TeamAssignment.module.css';

const TeamAssignment: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className={styles.pageTitle}>มอบหมายทีมช่าง (#REQ-1002)</h2>
          </div>
          <span className={styles.headerBadge}>รอการมอบหมาย</span>
        </div>

        {/* Main Grid Layout */}
        <div className={styles.mainGrid}>
          {/* Left Pane: Request Details */}
          <div className={styles.detailsPane}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>info</span>
                รายละเอียดคำร้อง
              </h3>
              
              <div className={styles.detailsList}>
                {/* Requester Info */}
                <div className={styles.infoBox}>
                  <div className={styles.infoIcon}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className={styles.infoLabel}>ผู้แจ้งซ่อม</p>
                    <p className={styles.infoValue}>คุณสมชาย ใจดี (แผนกบุคคล)</p>
                    <p className={styles.infoSubValue}>อาคาร A, ชั้น 3, ห้อง 302</p>
                    <p className={styles.infoSubValue}>081-234-5678</p>
                  </div>
                </div>

                {/* Problem Description */}
                <div className={styles.problemSection}>
                  <p className={styles.infoLabel}>หัวข้อปัญหา</p>
                  <p className={styles.problemTitle}>แอร์ไม่เย็น มีน้ำหยด</p>
                  <div className={styles.descriptionBox}>
                    เครื่องปรับอากาศหมายเลข AC-302-1 เปิดแล้วไม่เย็น มีแต่ลมออก และมีน้ำหยดลงมาที่พื้นบริเวณใต้เครื่อง ขอให้ช่างเข้ามาตรวจสอบด่วน
                  </div>
                </div>

                {/* Before Photos */}
                <div>
                  <p className={styles.infoLabel}>รูปภาพประกอบ (2)</p>
                  <div className={styles.photoGrid}>
                    <img 
                      alt="Leaking AC" 
                      className={styles.thumbnail}
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiAuNTvxwcPJ5KCvaTIm9by8oqN_Nlv0Sw6GVOMRBKBuNt5CXKAiIiis1Pfr6V3jYQxUIyBx9z_jHZRPuf8wmKX8s925jN8XdZzAJAzdk90yz2FMRBnrZMqQz1YDy1yODE_vnq63OB9Z1t0JZBBwdtP1CC4gdYmdKcsaRzEYBAXIA1X3PW7H1lCQB7JCeMmAaNviaU2LRX_0Vgs_AKEbmoMjLmFpxUTrz9Rxe1HO9MXgVvPTZP2pQwbA4k_SrzEsBuI3_ZO78n8oOY" 
                    />
                    <img 
                      alt="Water puddle" 
                      className={styles.thumbnail}
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQb5cXa4xSiSrvuAEul00EcCzLinGj9P4SX9yeYnHcz2S5aAwauyn-i4uA5TIh2JmyFt-vRado8_Di4vCDKKs4LFDLxYsW-hqx2sHSIEkV459d5f17YIEye0fX1yQduHydRRnAYbSqRd9tWs22Nv-IvXOhVMarvFtnNnilNk5xTcOp4y6ef1KfTQPaIj0V3OLy10t624hImCQ_X49ST-jJq8GAhDpPxnDYUvY8uljQfdy1EMu5x0t0jmp18o0sPRFxFKbZoj96eXe9" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Assignment Form */}
          <div className={styles.formPane}>
            <div className={`${styles.card} ${styles.accentCard}`}>
              <div className={styles.accentBar}></div>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>engineering</span>
                ฟอร์มการมอบหมาย
              </h3>

              <form className={styles.form}>
                {/* Date/Time Picker */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>กำหนดวันเวลาเข้าซ่อม <span className={styles.required}>*</span></label>
                  <div className={styles.inputGrid}>
                    <div className={styles.inputWithIcon}>
                      <span className={`material-symbols-outlined ${styles.prefixIcon}`}>calendar_today</span>
                      <input className={styles.input} type="date" defaultValue="2023-10-25" />
                    </div>
                    <div className={styles.inputWithIcon}>
                      <span className={`material-symbols-outlined ${styles.prefixIcon}`}>schedule</span>
                      <input className={styles.input} type="time" defaultValue="14:00" />
                    </div>
                  </div>
                </div>

                {/* Technician Selection */}
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldHeader}>
                    <label className={styles.fieldLabel}>เลือกช่างเทคนิค <span className={styles.required}>*</span></label>
                    <span className={styles.countInfo}>เลือกแล้ว 2 คน</span>
                  </div>
                  
                  <div className={styles.techList}>
                    {/* Tech 1 (Selected) */}
                    <div className={`${styles.techItem} ${styles.techItemSelected}`}>
                      <div className={styles.techMainInfo}>
                        <input className={styles.checkbox} type="checkbox" defaultChecked />
                        <img 
                          className={styles.techAvatar} 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdocRMNiYMRfLRqjl3ZxK9WPt3que3VN6X-p-CcGPStbZnTjxVGopmPoxv6uNiIQkinKtGd6NyTCmSKayMGLU0XamIKzY_K29BgAfsitsaF_toE92ivOvrxT1aO6iXgim8MIGD0YvsSf7S0wtgNG2WtpWBzyS8ypDP0b_TaTUaivtkKW23LTlwO0GQU6iya2PUhw3ivJOPyeVnUrQSfCUrl4fD5PMpsevvpR1YZe4uSu56sXwppz8ulfqm2QwIQGxUA_0Wot72MA_0" 
                          alt="Tech 1" 
                        />
                        <div>
                          <p className={styles.techName}>กฤษณะ แอร์เย็น</p>
                          <p className={styles.techDesc}>ผู้เชี่ยวชาญระบบปรับอากาศ (คิวว่าง)</p>
                        </div>
                      </div>
                      <div className={styles.roleAssignment}>
                        <label className={styles.roleLabel}>
                          <input type="radio" name="role1" defaultChecked /> Lead
                        </label>
                        <label className={styles.roleLabel}>
                          <input type="radio" name="role1" /> Assist
                        </label>
                      </div>
                    </div>

                    {/* Tech 2 (Selected) */}
                    <div className={styles.techItem}>
                      <div className={styles.techMainInfo}>
                        <input className={styles.checkbox} type="checkbox" defaultChecked />
                        <img 
                          className={styles.techAvatar} 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgwnHzvs1oTP0YPWYcu99Q9j4GWAwiVa4I0Xaspw7XP-I6BBp_Xcm30ybKNvnFd7HW-Aa_Ft1c6D4g8W6HCiGONub1srwTB7KKLTqkM3LrO78cEmjCVXhOSoa111V8xJ6nb5qPPhY1JUrYAl9Z2qP7avSpm3z2avNnnL-hjKIOz6RzVjnj0mlZKATGiZiDqbGO2Q8Qiqz-Ci7DIBfVRS1ao4YqPTFJv35_pvfWRx40OCmhKfVzotgXHht_vPbw3lFFgaNXaBU2iuK3" 
                          alt="Tech 2" 
                        />
                        <div>
                          <p className={styles.techName}>วิชาญ งานไว</p>
                          <p className={styles.techDesc}>ช่างทั่วไป (คิวว่าง)</p>
                        </div>
                      </div>
                      <div className={styles.roleAssignment}>
                        <label className={styles.roleLabel}>
                          <input type="radio" name="role2" /> Lead
                        </label>
                        <label className={styles.roleLabel}>
                          <input type="radio" name="role2" defaultChecked /> Assist
                        </label>
                      </div>
                    </div>

                    {/* Tech 3 (Unselected/Busy) */}
                    <div className={`${styles.techItem} ${styles.techItemDisabled}`}>
                      <div className={styles.techMainInfo}>
                        <input className={styles.checkbox} type="checkbox" />
                        <div className={styles.initialAvatar}>ท</div>
                        <div>
                          <p className={styles.techName}>ทวีศักดิ์ ไฟฟ้า</p>
                          <p className={styles.techDescBusy}>ติดงานซ่อมอาคาร B (ถึง 15:00)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note Textarea */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>บันทึกจากผู้ดูแลระบบ</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="เพิ่มรายละเอียดเพิ่มเติมหรือข้อควรระวังสำหรับช่าง..." 
                    rows={3}
                  ></textarea>
                </div>

                {/* Actions */}
                <div className={styles.formActions}>
                  <button className={styles.cancelButton} type="button" onClick={() => navigate(-1)}>ยกเลิก</button>
                  <button className={styles.confirmButton} type="button">
                    <span className="material-symbols-outlined">check_circle</span>
                    ยืนยันการมอบหมาย
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeamAssignment;
