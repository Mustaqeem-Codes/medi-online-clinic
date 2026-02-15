// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if backend is running
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => {
        setBackendStatus('connected');
        console.log('Backend connected:', data);
      })
      .catch(err => {
        setBackendStatus('disconnected');
        console.error('Backend not running:', err);
      });

    // Fetch welcome message
    fetch('http://localhost:5000/')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Failed to fetch message:', err));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 Medi Online Clinic</h1>
        <div className="status">
          Backend Status: 
          <span className={`status-${backendStatus}`}>
            {backendStatus === 'connected' ? ' ✅ Connected' : ' ❌ Disconnected'}
          </span>
        </div>
        {message && (
          <div className="welcome-message">
            {message}
          </div>
        )}
        <p className="subtitle">
          Connecting Patients with Doctors, Digitally
        </p>
      </header>

      <main className="app-main">
        <div className="feature-grid">
          <div className="feature-card">
            <h3>👤 For Patients</h3>
            <ul>
              <li>Find doctors by specialty</li>
              <li>Book appointments online</li>
              <li>Secure payments</li>
              <li>Medical records</li>
            </ul>
          </div>

          <div className="feature-card">
            <h3>👨‍⚕️ For Doctors</h3>
            <ul>
              <li>Manage schedule</li>
              <li>Track earnings</li>
              <li>Digital prescriptions</li>
              <li>Video consultations</li>
            </ul>
          </div>

          <div className="feature-card">
            <h3>👑 For Admin</h3>
            <ul>
              <li>Verify doctors</li>
              <li>Platform analytics</li>
              <li>Moderate reviews</li>
              <li>Manage payments</li>
            </ul>
          </div>
        </div>

        <div className="tech-stack">
          <h3>🚀 Tech Stack</h3>
          <div className="tech-tags">
            <span>React</span>
            <span>Node.js</span>
            <span>PostgreSQL</span>
            <span>Express</span>
            <span>Stripe</span>
            <span>JWT</span>
          </div>
        </div>

        <div className="setup-reminder">
          <h4>📋 Next Steps:</h4>
          <ol>
            <li>Start backend: <code>cd backend && npm run dev</code></li>
            <li>Create PostgreSQL database</li>
            <li>Set up authentication</li>
            <li>Build doctor search</li>
          </ol>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2024 Medi Online Clinic. All rights reserved.</p>
        <p className="demo-notice">Demo Version - For Educational Purposes</p>
      </footer>
    </div>
  );
}

export default App;