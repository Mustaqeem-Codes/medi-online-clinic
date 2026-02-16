// frontend/src/components/auth/PatientRegisterForm.jsx
import React, { useState } from 'react';
import '../../styles/auth//PatientRegisterForm.css';

const PatientRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Patient data:', formData);
      setIsLoading(false);
      // Redirect or show success
    }, 1500);
  };

  return (
    <div className="patient-form-container">
      <form onSubmit={handleSubmit} className="patient-form">
        <h2 className="patient-form-title">Create Patient Account</h2>
        {errors.general && <div className="patient-error-general">{errors.general}</div>}

        <div className="patient-field">
          <label className="patient-label">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className={`patient-input ${errors.name ? 'error' : ''}`} placeholder="John Doe" />
          {errors.name && <span className="patient-error">{errors.name}</span>}
        </div>

        <div className="patient-field">
          <label className="patient-label">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={`patient-input ${errors.email ? 'error' : ''}`} placeholder="john@example.com" />
          {errors.email && <span className="patient-error">{errors.email}</span>}
        </div>

        <div className="patient-field">
          <label className="patient-label">Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`patient-input ${errors.phone ? 'error' : ''}`} placeholder="+1 234 567 890" />
          {errors.phone && <span className="patient-error">{errors.phone}</span>}
        </div>

        <div className="patient-field">
          <label className="patient-label">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className={`patient-input ${errors.password ? 'error' : ''}`} placeholder="••••••••" />
          {errors.password && <span className="patient-error">{errors.password}</span>}
        </div>

        <div className="patient-field">
          <label className="patient-label">Confirm Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`patient-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="••••••••" />
          {errors.confirmPassword && <span className="patient-error">{errors.confirmPassword}</span>}
        </div>

        <div className="patient-field patient-terms">
          <label className="patient-checkbox">
            <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
            <span>I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a></span>
          </label>
          {errors.agreeTerms && <span className="patient-error">{errors.agreeTerms}</span>}
        </div>

        <button type="submit" className="patient-submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Sign Up as Patient'}
        </button>
      </form>
    </div>
  );
};

export default PatientRegisterForm;