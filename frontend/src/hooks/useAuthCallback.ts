import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

export function useAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCallback = useCallback(async (code: string | null, state: string | null) => {
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
      const inviteToken = localStorage.getItem('pending_invite_token');

      // 1. Exchange the code for our backend JWT token
      const tokenData = await apiClient('/auth/line/callback', {
        method: 'POST',
        data: { code, state, invite_token: inviteToken || undefined },
      });

      // Save token
      const accessToken = tokenData.access_token;
      localStorage.setItem('access_token', accessToken);
      localStorage.removeItem('pending_invite_token');

      // 2. Fetch /auth/me to check if emp_id is populated
      // Since we just saved it in localStorage, apiClient will automatically use it.
      const userData = await apiClient('/auth/me');

      // Save user info
      localStorage.setItem('user', JSON.stringify(userData));

      // 3. Redirect based on emp_id
      if (!userData.emp_id) {
        // Employee ID is null, ask them to complete profile
        navigate('/complete-profile', { replace: true });
      } else if (userData.role === 'ADMIN') {
        navigate('/admin/requests', { replace: true });  
      } else {
        // Profile complete, go to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during login');
      }
    }
  }, [navigate]);

  return { error, handleCallback };
}
