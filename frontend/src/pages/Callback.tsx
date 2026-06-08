import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Callback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const savedState = localStorage.getItem('line_oauth_state');

      if (!code) {
        setError('No authorization code provided by LINE.');
        return;
      }

      if (state !== savedState) {
        setError('Invalid state parameter. Possible CSRF attack.');
        return;
      }

      try {
        // 1. Exchange the code for our backend JWT token
        const tokenRes = await fetch(`${API_BASE_URL}/auth/line/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state })
        });

        if (!tokenRes.ok) throw new Error('Failed to exchange code');
        const tokenData = await tokenRes.json();
        
        // Save token
        const accessToken = tokenData.access_token;
        localStorage.setItem('access_token', accessToken);

        // 2. Fetch /auth/me to check if emp_id is populated
        const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!meRes.ok) throw new Error('Failed to fetch user profile');
        const userData = await meRes.json();
        
        // Save user info
        localStorage.setItem('user', JSON.stringify(userData));

        // 3. Redirect based on emp_id
        if (!userData.emp_id) {
          // Employee ID is null, ask them to complete profile
          navigate('/complete-profile', { replace: true });
        } else {
          // Profile complete, go to dashboard
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred during login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Login Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Logging you in...</h2>
      <p>Please wait while we verify your LINE account.</p>
    </div>
  );
};

export default Callback;
