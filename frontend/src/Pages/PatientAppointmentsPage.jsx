import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../components/dashboard/PatientSidebar';
import AppointmentMessages from '../components/messages/AppointmentMessages';
import '../styles/PatientAppointmentsPage.css';
import { API_BASE_URL } from '../config/api';

const formatDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) return 'TBD';
  const [hours, minutes] = value.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes || 0));
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const PatientAppointmentsPage = () => {
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
        const response = await fetch(`${API_BASE_URL}/api/appointments/patient`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load appointments');
        }

        const mapped = data.data.map((item) => ({
          id: item.id,
          doctor: item.doctor_name,
          specialty: item.doctor_specialty,
          date: formatDate(item.appointment_date),
          time: formatTime(item.appointment_time),
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
    <div className="mc-patient-appointments">
      <PatientSidebar />
      <main className="mc-patient-appointments__content">
        <header className="mc-patient-appointments__header">
          <h1>Appointments</h1>
          <p>Track upcoming visits and past consultations.</p>
        </header>

        {loading && <div className="mc-patient-appointments__state">Loading appointments...</div>}
        {error && <div className="mc-patient-appointments__error">{error}</div>}
        {!loading && !error && (
          <section className="mc-patient-appointments__card">
            <div className="mc-patient-appointments__list">
              {appointments.length === 0 ? (
                <div className="mc-patient-appointments__empty">
                  <p>No appointments scheduled yet.</p>
                  <span>Start by booking a visit with a specialist.</span>
                </div>
              ) : (
                appointments.map((item) => (
                  <div key={item.id} className="mc-patient-appointments__item">
                    <div>
                      <p className="mc-patient-appointments__name">{item.doctor}</p>
                      <span className="mc-patient-appointments__meta">{item.specialty}</span>
                    </div>
                    <div className="mc-patient-appointments__time">
                      <span>{item.date}</span>
                      <span>{item.time}</span>
                    </div>
                    <div className="mc-patient-appointments__actions">
                      <span className={`mc-patient-appointments__status mc-patient-appointments__status--${item.status}`}>
                        {item.status}
                      </span>
                      <button
                        type="button"
                        className="mc-patient-appointments__message"
                        onClick={() => {
                          setActiveAppointmentId(item.id);
                          setActiveAppointmentStatus(item.status);
                        }}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
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

export default PatientAppointmentsPage;
