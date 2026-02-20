import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../components/dashboard/PatientSidebar';
import AppointmentMessages from '../components/messages/AppointmentMessages';
import '../styles/PatientMessagesPage.css';

const PatientMessagesPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [activeAppointmentStatus, setActiveAppointmentStatus] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?role=patient');
      return;
    }

    const loadAppointments = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:5000/api/appointments/patient', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load appointments');
        }

        const mapped = (data.data || []).map((item) => ({
          id: item.id,
          doctor: item.doctor_name,
          status: item.status || 'pending'
        }));
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
    <div className="mc-patient-messages">
      <PatientSidebar />
      <main className="mc-patient-messages__content">
        <header className="mc-patient-messages__header">
          <h1>Messages</h1>
          <p>Chat with your care team and receive updates.</p>
        </header>

        {loading && <div className="mc-patient-messages__state">Loading appointments...</div>}
        {error && <div className="mc-patient-messages__error">{error}</div>}

        {!loading && !error && (
          <section className="mc-patient-messages__card">
            {appointments.length === 0 ? (
              <p className="mc-patient-messages__empty">No appointments yet. Book a visit to start messaging.</p>
            ) : (
              <div className="mc-patient-messages__list">
                {appointments.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="mc-patient-messages__item"
                    onClick={() => {
                      setActiveAppointmentId(item.id);
                      setActiveAppointmentStatus(item.status);
                    }}
                  >
                    <div>
                      <p>{item.doctor}</p>
                      <span>Status: {item.status}</span>
                    </div>
                    <span className="mc-patient-messages__item-action">Open</span>
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
            role="patient"
            onClose={() => setActiveAppointmentId(null)}
          />
        )}
      </main>
    </div>
  );
};

export default PatientMessagesPage;
