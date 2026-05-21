import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateRequest.module.css';

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submit
    navigate('/dashboard');
  };

  return (
    <div className={styles.pageWrapper}>
      {/* TopAppBar */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className={styles.headerTitle}>แจ้งซ่อมใหม่</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="category">
              หมวดหมู่ <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <select className={styles.select} id="category" required>
                <option value="" disabled selected>เลือกหมวดหมู่ปัญหา</option>
                <option value="ไฟฟ้า">ไฟฟ้า</option>
                <option value="ประปา">ประปา</option>
                <option value="แอร์">แอร์</option>
                <option value="IT">IT</option>
                <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
                <option value="อื่น ๆ">อื่น ๆ</option>
              </select>
              <div className={styles.selectIcon}>
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="issue_title">
              หัวข้อปัญหา <span className={styles.required}>*</span>
            </label>
            <input 
              className={styles.input} 
              id="issue_title" 
              placeholder="เช่น แอร์ไม่เย็น, หลอดไฟขาด" 
              type="text" 
              required 
            />
          </div>

          {/* Location Input */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="location">
              สถานที่ / ห้อง / จุดที่พบปัญหา <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWithIcon}>
              <span className={`material-symbols-outlined ${styles.prefixIcon}`}>location_on</span>
              <input 
                className={styles.input} 
                id="location" 
                placeholder="ระบุตำแหน่งที่ชัดเจน" 
                type="text" 
                style={{ paddingLeft: '44px' }}
                required 
              />
            </div>
          </div>

          {/* Details Textarea */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="details">รายละเอียดปัญหา</label>
            <textarea 
              className={styles.textarea} 
              id="details" 
              placeholder="อธิบายอาการเบื้องต้น หรือข้อมูลเพิ่มเติม..." 
              rows={3} 
            ></textarea>
          </div>

          {/* Urgency Chips */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>ความเร่งด่วน</label>
            <div className={styles.urgencyGroup}>
              <label className={styles.urgencyLabel}>
                <input className={styles.radioHidden} name="urgency" type="radio" value="low" />
                <div className={`${styles.urgencyChip} ${styles.urgencyLow}`}>ต่ำ</div>
              </label>
              <label className={styles.urgencyLabel}>
                <input className={styles.radioHidden} name="urgency" type="radio" value="normal" defaultChecked />
                <div className={`${styles.urgencyChip} ${styles.urgencyNormal}`}>ปกติ</div>
              </label>
              <label className={styles.urgencyLabel}>
                <input className={styles.radioHidden} name="urgency" type="radio" value="high" />
                <div className={`${styles.urgencyChip} ${styles.urgencyHigh}`}>สูง</div>
              </label>
              <label className={styles.urgencyLabel}>
                <input className={styles.radioHidden} name="urgency" type="radio" value="urgent" />
                <div className={`${styles.urgencyChip} ${styles.urgencyUrgent}`}>เร่งด่วน</div>
              </label>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>อัปโหลดรูปภาพประกอบ</label>
            <button className={styles.uploadButton} type="button">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add_a_photo</span>
              <span className={styles.uploadText}>แตะเพื่อถ่ายรูป หรือเลือกรูปภาพ</span>
            </button>
          </div>

          {/* Contact Phone Input */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="contact_phone">
              เบอร์ติดต่อ <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWithIcon}>
              <span className={`material-symbols-outlined ${styles.prefixIcon}`}>call</span>
              <input 
                className={styles.input} 
                id="contact_phone" 
                placeholder="08X-XXX-XXXX" 
                type="tel" 
                style={{ paddingLeft: '44px' }}
                required 
              />
            </div>
          </div>
        </form>
      </main>

      {/* Bottom Action Area */}
      <div className={styles.bottomArea}>
        <div className={styles.bottomContainer}>
          <button className={styles.submitButton} type="submit" onClick={handleSubmit}>
            <span className="material-symbols-outlined">send</span>
            ส่งคำแจ้งซ่อม
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
