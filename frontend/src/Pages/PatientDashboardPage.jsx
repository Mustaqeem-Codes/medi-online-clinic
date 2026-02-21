import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../components/dashboard/PatientSidebar';
import AppointmentsList from '../components/dashboard/AppointmentsList';
import '../styles/PatientDashboardPage.css';
import { API_BASE_URL } from '../config/api';

const PatientDashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?role=patient');
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const [profileRes, appointmentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/patients/profile`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`${API_BASE_URL}/api/appointments/patient`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        const [profileData, appointmentsData] = await Promise.all([
          profileRes.json(),
          appointmentsRes.json()
        ]);

        if (!profileRes.ok) {
          throw new Error(profileData.error || 'Failed to load profile');
        }
        if (!appointmentsRes.ok) {
          throw new Error(appointmentsData.error || 'Failed to load appointments');
        }

        setProfile(profileData.data);
        const mapped = (appointmentsData.data || []).slice(0, 5).map((item) => ({
          id: item.id,
          doctor: item.doctor_name,
          specialty: item.doctor_specialty,
          date: item.appointment_date,
          time: item.appointment_time,
          status: item.status || 'pending'
        }));
        setAppointments(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate('/dashboard/patient/profile');
  };

  return (
    <div className="mc-dashboard-layout">
      <PatientSidebar />
      <div className="mc-dashboard">
        <header className="mc-dashboard__header">
          <div>
            <p className="mc-dashboard__eyebrow">Patient Dashboard</p>
            <h1 className="mc-dashboard__title">
              {profile ? `Welcome, ${profile.name}!` : 'Welcome'}
            </h1>
            <p className="mc-dashboard__subtitle">Here is a quick overview of your care.</p>
          </div>
        </header>

        {loading && <div className="mc-dashboard__state">Loading your profile...</div>}
        {error && <div className="mc-dashboard__error">{error}</div>}

        {!loading && !error && (
          <div className="mc-dashboard__grid">
            <AppointmentsList
              items={appointments}
            />

            <section className="mc-dashboard__card">
              <h2>Your Profile</h2>
              <div className="mc-dashboard__profile">
                <div>
                  <span>Email</span>
                  <p>{profile.email}</p>
                </div>
                <div>
                  <span>Phone</span>
                  <p>{profile.phone}</p>
                </div>
                <div>
                  <span>Date of Birth</span>
                  <p>{profile.date_of_birth || 'Not provided'}</p>
                </div>
                <div>
                  <span>Location</span>
                  <p>{profile.location || 'Not provided'}</p>
                </div>
              </div>
              <button
                className="mc-dashboard__button mc-dashboard__button--ghost"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
            </section>

            <section className="mc-dashboard__card">
              <h2>Quick Actions</h2>
              <div className="mc-dashboard__actions">
                <button className="mc-dashboard__action">Find a Specialist</button>
                <button className="mc-dashboard__action">View Prescriptions</button>
                <button className="mc-dashboard__action">Message Support</button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboardPage;