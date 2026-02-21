import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/BookingPage.css';
import { API_BASE_URL } from '../config/api';

const BookingPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toLabel = (value) => {
    const [hours, minutes] = value.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes || 0), 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load doctor details');
        }
        setDoctor(data.data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!appointmentDate) {
      setSlots([]);
      setAppointmentTime('');
      return;
    }

    const loadSlots = async () => {
      setSlotsLoading(true);
      setError('');
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/appointments/doctor/${doctorId}/slots?date=${appointmentDate}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load available slots');
        }
        setSlots(data.data.available_slots || []);
      } catch (err) {
        setSlots([]);
        setError(err.message);
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
  }, [appointmentDate, doctorId]);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!appointmentDate || !appointmentTime) {
      setError('Please select a date and available time slot.');
      return;
    }

    if (!reason.trim()) {
      setError('Reason for appointment is required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: Number(doctorId),
          appointment_date: appointmentDate,
          appointment_time: `${appointmentTime}:00`,
          reason: reason.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        const availableSlots = data?.data?.available_slots;
        if (Array.isArray(availableSlots)) {
          setSlots(availableSlots);
          throw new Error('Selected slot is no longer available. Please choose another available slot.');
        }
        throw new Error(data.error || 'Failed to book appointment');
      }

      setSuccess('Appointment booked successfully.');
      setTimeout(() => navigate('/dashboard/patient/appointments'), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mc-booking">
      <header className="mc-booking__header">
        <div>
          <p className="mc-booking__eyebrow">Book Appointment</p>
          <h1>Schedule your visit</h1>
          <p>Select a date and time that works for you.</p>
        </div>
      </header>

      <section className="mc-booking__card">
        <div className="mc-booking__summary">
          <h2>{doctor ? doctor.name : `Doctor #${doctorId}`}</h2>
          <p>Specialty: {doctor?.specialty || 'Loading...'}</p>
          <p>Location: {doctor?.location || 'Not provided'}</p>
          <p>Availability: {doctor?.availability_mode === '24_7' ? '24/7 (any hour)' : 'Scheduled slots'}</p>
        </div>

        {error && <div className="mc-booking__error">{error}</div>}
        {success && <div className="mc-booking__success">{success}</div>}

        <div className="mc-booking__grid">
          <div className="mc-booking__panel">
            <h3>Select Date</h3>
            <input
              type="date"
              className="mc-booking__input"
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
            />
          </div>
          <div className="mc-booking__panel">
            <h3>Select Time</h3>
            <div className="mc-booking__slots">
              {slotsLoading && <p>Loading available slots...</p>}
              {!slotsLoading && appointmentDate && slots.length === 0 && (
                <p>No slots available for this date.</p>
              )}
              {!slotsLoading && slots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={appointmentTime === time ? 'is-active' : ''}
                  onClick={() => setAppointmentTime(time)}
                >
                  {toLabel(time)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mc-booking__panel">
          <h3>Reason for visit (required)</h3>
          <textarea
            className="mc-booking__textarea"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Briefly describe your symptoms"
            rows="3"
          />
        </div>

        <button className="mc-booking__cta" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </section>
    </div>
  );
};

export default BookingPage;
