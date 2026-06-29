import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthCallback } from '../hooks/useAuthCallback';

const Callback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { error, handleCallback } = useAuthCallback();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    handleCallback(code, state);
  }, [searchParams, handleCallback]);

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
