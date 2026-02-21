import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import '../styles/DoctorDetailPage.css';
import { API_BASE_URL } from '../config/api';

const prettyTime = (value) => {
  if (!value) return 'N/A';
  const [hours, minutes] = value.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes || 0), 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const DoctorDetailPage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDoctor = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load doctor details');
        }
        setDoctor(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [id]);

  useEffect(() => {
    if (!selectedDate || !id) return;

    const loadSlots = async () => {
      setSlotsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/appointments/doctor/${id}/slots?date=${selectedDate}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load available slots');
        }
        setAvailableSlots(data.data.available_slots || []);
      } catch {
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
  }, [id, selectedDate]);

  const timetableLabel = useMemo(() => {
    if (!doctor) return '';
    if (doctor.availability_mode === '24_7') return '24/7 (any hour)';
    const slots = Array.isArray(doctor.availability_slots) ? doctor.availability_slots : [];
    if (slots.length === 0) return 'Not configured yet';
    return slots.map((slot) => prettyTime(slot)).join(', ');
  }, [doctor]);

  if (loading) {
    return <div className="mc-doctor-detail">Loading doctor profile...</div>;
  }

  if (error || !doctor) {
    return <div className="mc-doctor-detail">{error || 'Doctor not found'}</div>;
  }

  return (
    <div className="mc-doctor-detail">
      <header className="mc-doctor-detail__hero">
        <div>
          <p className="mc-doctor-detail__eyebrow">Doctor Profile</p>
          <h1>{doctor.name}</h1>
          <p className="mc-doctor-detail__subtitle">{doctor.specialty} · {doctor.location}</p>
        </div>
        <Link to={`/book/${doctor.id}`} className="mc-doctor-detail__cta">
          Book Appointment
        </Link>
      </header>

      <div className="mc-doctor-detail__grid">
        <section className="mc-doctor-detail__card">
          <h2>Doctor Information</h2>
          <p>Specialty: {doctor.specialty}</p>
          <p>Location: {doctor.location || 'Not provided'}</p>
          <p>Verification: Approved</p>
        </section>

        <section className="mc-doctor-detail__card">
          <h2>Timetable</h2>
          <p>{timetableLabel}</p>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
          <div className="mc-doctor-detail__slots">
            {!selectedDate && <p>Select a date to view available slots.</p>}
            {slotsLoading && <p>Loading available slots...</p>}
            {selectedDate && !slotsLoading && availableSlots.length === 0 && (
              <p>No slots available for this date.</p>
            )}
            {selectedDate && !slotsLoading && availableSlots.map((slot) => (
              <button key={slot} type="button">{prettyTime(slot)}</button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
