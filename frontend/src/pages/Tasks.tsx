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
    // Fetch all requests for user 1 (mocking current user)
    fetch(`${API_BASE_URL}/repair-requests`)
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        setRequests(data.filter((req: RepairRequest) => req.status !== "PENDING"));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch API", err);
        setLoading(false);
      });
  });

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
