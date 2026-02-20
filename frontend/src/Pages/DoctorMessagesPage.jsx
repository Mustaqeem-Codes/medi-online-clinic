import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../components/dashboard/DoctorSidebar';
import AppointmentMessages from '../components/messages/AppointmentMessages';
import '../styles/DoctorMessagesPage.css';

const DoctorMessagesPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [activeAppointmentStatus, setActiveAppointmentStatus] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?role=doctor');
      return;
    }

    const loadAppointments = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:5000/api/appointments/doctor', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load appointments');
        }

        const mapped = (data.data || [])
          .map((item) => ({
            id: item.id,
            patient: item.patient_name,
            status: item.status || 'pending'
          }))
          .filter((item) => ['pending', 'confirmed', 'rejected'].includes(item.status));
        setAppointments(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [navigate]);

  return (
    <div className="mc-doctor-messages">
      <DoctorSidebar />
      <main className="mc-doctor-messages__content">
        <header className="mc-doctor-messages__header">
          <h1>Messages</h1>
          <p>Stay in touch with your patients and support team.</p>
        </header>

        {loading && <div className="mc-doctor-messages__state">Loading appointments...</div>}
        {error && <div className="mc-doctor-messages__error">{error}</div>}

        {!loading && !error && (
          <section className="mc-doctor-messages__card">
            {appointments.length === 0 ? (
              <p className="mc-doctor-messages__empty">No appointment requests yet.</p>
            ) : (
              <div className="mc-doctor-messages__list">
                {appointments.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="mc-doctor-messages__item"
                    onClick={() => {
                      setActiveAppointmentId(item.id);
                      setActiveAppointmentStatus(item.status);
                    }}
                  >
                    <div>
                      <p>{item.patient}</p>
                      <span>Status: {item.status}</span>
                    </div>
                    <span className="mc-doctor-messages__item-action">Open</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {activeAppointmentId && (
          <AppointmentMessages
            appointmentId={activeAppointmentId}
            appointmentStatus={activeAppointmentStatus}
            role="doctor"
            onClose={() => setActiveAppointmentId(null)}
          />
        )}
      </main>
    </div>
  );
};

export default DoctorMessagesPage;
