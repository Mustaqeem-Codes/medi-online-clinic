// frontend/src/components/auth/LoginPrompt.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth/LoginPrompt.css';

const LoginPrompt = () => {
  return (
    <div className="login-prompt">
      <p className="login-prompt-text">
        Already have an account?{' '}
        <Link to="/login" className="login-prompt-link">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default LoginPrompt;