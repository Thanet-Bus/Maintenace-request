import React, { useState } from 'react';
import styles from './CompleteProfile.module.css';
import { useCompleteProfile } from '../hooks/useCompleteProfile';

const CompleteProfile: React.FC = () => {
  const [empId, setEmpId] = useState('');
  const { user, loading, error, setError, completeProfile } = useCompleteProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId.trim()) {
      setError('กรุณากรอกรหัสพนักงาน (Please enter Employee ID)');
      return;
    }
    await completeProfile(empId);
  };

  if (!user) return null; // Or a loading spinner

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>ตั้งค่าโปรไฟล์<br/>(Complete Profile)</h2>
        <p className={styles.description}>
          กรุณากรอกรหัสพนักงานเพื่อดำเนินการต่อ<br/>
          (Please enter your Employee ID to continue.)
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="empId" className={styles.label}>รหัสพนักงาน (Employee ID)</label>
            <input
              type="text"
              id="empId"
              className={styles.input}
              value={empId}
              onChange={(e) => {
                setEmpId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="เช่น EMP12345"
              disabled={loading}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={loading || !empId.trim()}>
            {loading ? 'กำลังบันทึก... (Saving...)' : 'ยืนยัน (Submit)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
