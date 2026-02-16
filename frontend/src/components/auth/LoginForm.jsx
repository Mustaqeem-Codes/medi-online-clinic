// frontend/src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth/LoginForm.css';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    identifier: '', // email or phone
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone is required';
    } else if (
      !formData.identifier.includes('@') && 
      !/^\+?[\d\s-]{10,}$/.test(formData.identifier)
    ) {
      newErrors.identifier = 'Enter a valid email or phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Login data:', formData);
      // On success, call the parent handler
      if (onLoginSuccess) onLoginSuccess(formData);
    } catch (error) {
      setErrors({ general: 'Invalid credentials. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Welcome Back</h2>

        {errors.general && (
          <div className="login-error-general">{errors.general}</div>
        )}

        <div className="login-field">
          <label htmlFor="identifier" className="login-label">
            Email or Phone
          </label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            placeholder="Enter your email or phone"
            className={`login-input ${errors.identifier ? 'error' : ''}`}
          />
          {errors.identifier && (
            <span className="login-error">{errors.identifier}</span>
          )}
        </div>

        <div className="login-field">
          <label htmlFor="password" className="login-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`login-input ${errors.password ? 'error' : ''}`}
          />
          {errors.password && (
            <span className="login-error">{errors.password}</span>
          )}
        </div>

        <div className="login-options">
          <label className="login-remember">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="login-forgot">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="login-submit"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;