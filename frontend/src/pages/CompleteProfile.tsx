import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CompleteProfile.module.css';
import { API_BASE_URL } from '../config';
import type { User } from '../types/types';

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUserData() {
      try {
        const tokenStr = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (!tokenStr || !userStr) {
          if (!cancelled) navigate('/login');
          return;
        }

        const userData = JSON.parse(userStr);
        
        if (userData.emp_id) {
          if (!cancelled) navigate('/dashboard');
          return;
        }

        if (!cancelled) {
          setToken(tokenStr);
          setUser(userData);
        }
      } catch (err) {
        console.error("Error loading user data from local storage", err);
        // If JSON.parse fails, clear corrupted data and force re-login
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        if (!cancelled) navigate('/login');
      }
    }

    loadUserData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!empId.trim()) {
      setError('กรุณากรอกรหัสพนักงาน (Please enter Employee ID)');
      return;
    }

    if (!user || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ emp_id: empId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update local storage with the new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An error occurred while updating your profile.';
      setError(message);
    } finally {
      setLoading(false);
    }
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
              onChange={(e) => setEmpId(e.target.value)}
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
