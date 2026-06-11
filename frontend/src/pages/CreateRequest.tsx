import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateRequest.module.css';
import { useCreateRequest } from '../hooks/useCreateRequest';

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [phone, setPhone] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createRequest, isSubmitting, error, setError } = useCreateRequest();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createRequest({ category, title, location, details, phone, imageFile });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* TopAppBar */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate(-1)} type="button">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className={styles.headerTitle}>แจ้งซ่อมใหม่</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {/* Category Selection */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="category">
              หมวดหมู่ <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <select 
                className={styles.select} 
                id="category" 
                required
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (error) setError(null);
                }}
                >
                <option value="" disabled>เลือกหมวดหมู่ปัญหา</option>
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
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
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
                value={location}
                onChange={(e) => {
                setLocation(e.target.value);
                if (error) setError(null);
              }}
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
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                if (error) setError(null);
              }}
            ></textarea>
          </div>

          {/* Image Upload Area */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>อัปโหลดรูปภาพประกอบ</label>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageChange} 
            />
            
            {imagePreview ? (
              <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-outline-variant)' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'contain' }} />
                <button 
                  type="button" 
                  onClick={clearImage}
                  style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px', 
                    background: 'rgba(0,0,0,0.6)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '32px', 
                    height: '32px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer' 
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <button 
                className={styles.uploadButton} 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add_a_photo</span>
                <span className={styles.uploadText}>แตะเพื่อถ่ายรูป หรือเลือกรูปภาพ</span>
              </button>
            )}
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
                value={phone}
                onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError(null);
              }}
              />
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className={styles.bottomArea}>
            <div className={styles.bottomContainer}>
              <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
                <span className="material-symbols-outlined">send</span>
                {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำแจ้งซ่อม'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateRequest;