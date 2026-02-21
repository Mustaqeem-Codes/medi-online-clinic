import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../components/dashboard/DoctorSidebar';
import AppointmentMessages from '../components/messages/AppointmentMessages';
import '../styles/DoctorAppointmentsPage.css';
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

const DoctorAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
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
        const response = await fetch(`${API_BASE_URL}/api/appointments/doctor`, {
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
          patient: item.patient_name,
          specialty: item.reason || 'Consultation',
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

  const handleStatusUpdate = async (appointmentId, nextStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?role=doctor');
      return;
    }

    if (nextStatus === 'rejected') {
      const confirmReject = window.confirm('Are you sure you want to reject this appointment?');
      if (!confirmReject) return;
    }

    setUpdatingId(appointmentId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update appointment');
      }

      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId ? { ...item, status: data.data.status } : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mc-doctor-appointments">
      <DoctorSidebar />
      <main className="mc-doctor-appointments__content">
        <header className="mc-doctor-appointments__header">
          <h1>Appointments</h1>
          <p>Manage your upcoming visits and patient requests.</p>
        </header>

        {loading && <div className="mc-doctor-appointments__state">Loading appointments...</div>}
        {error && <div className="mc-doctor-appointments__error">{error}</div>}

        {!loading && !error && (
          <section className="mc-doctor-appointments__card">
            <div className="mc-doctor-appointments__list">
              {appointments.map((item) => (
                <div key={item.id} className="mc-doctor-appointments__item">
                  <div>
                    <p className="mc-doctor-appointments__name">{item.patient}</p>
                    <span className="mc-doctor-appointments__meta">{item.specialty}</span>
                  </div>
                  <div className="mc-doctor-appointments__time">
                    <span>{item.date}</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="mc-doctor-appointments__actions">
                    <span className={`mc-doctor-appointments__status mc-doctor-appointments__status--${item.status}`}>
                      {item.status}
                    </span>
                    {item.status === 'pending' && (
                      <div className="mc-doctor-appointments__buttons">
                        <button
                          type="button"
                          className="mc-doctor-appointments__btn mc-doctor-appointments__btn--confirm"
                          onClick={() => handleStatusUpdate(item.id, 'confirmed')}
                          disabled={updatingId === item.id}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="mc-doctor-appointments__btn mc-doctor-appointments__btn--reject"
                          onClick={() => handleStatusUpdate(item.id, 'rejected')}
                          disabled={updatingId === item.id}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {['pending', 'confirmed', 'rejected'].includes(item.status) && (
                      <button
                        type="button"
                        className="mc-doctor-appointments__btn mc-doctor-appointments__btn--message"
                        onClick={() => {
                          setActiveAppointmentId(item.id);
                          setActiveAppointmentStatus(item.status);
                        }}
                      >
                        Message
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

export default DoctorAppointmentsPage;
