import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import JobCard from '../components/JobCard';
import type { RepairRequest } from '../types/types';
import styles from './UserDashboard.module.css';
import { API_BASE_URL } from "../config";

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        if (!cancelled) navigate('/login');
        return;
      }

      try {
        // Fetch all requests
        const res = await fetch(`${API_BASE_URL}/repair-requests`, {
           headers: {
             'Authorization': `Bearer ${token}`
           }
        });
        
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          if (!cancelled) navigate('/login');
          throw new Error("Unauthorized");
        }

        if (!res.ok) throw new Error("API failed");
        
        const data = await res.json();
        
        if (!cancelled) {
          setRequests(data.filter((req: RepairRequest) => req.status !== "PENDING" && req.status !== "COMPLETED"));
        }
      } catch (err) {
        console.error("Failed to fetch API", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <Layout title="รายการแจ้งซ่อม">
      <div className={styles.container}>
        <section className={styles.requestSection}>
          <h3 className={styles.sectionTitle}>รายการแจ้งซ่อมทั้งหมด</h3>
          
          {loading ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>กำลังโหลดข้อมูล...</p>
          ) : requests.length === 0 ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>ยังไม่มีรายการแจ้งซ่อม</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((request) => (
                <JobCard 
                  key={request.id} 
                  request={request} 
                  onClick={() => navigate(`/request/${request.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Tasks;
