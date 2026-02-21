import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../components/dashboard/DoctorSidebar';
import '../styles/DoctorPatientsPage.css';
import { API_BASE_URL } from '../config/api';

const DoctorPatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?role=doctor');
      return;
    }

    const loadPatients = async () => {
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
          throw new Error(data.error || 'Failed to load patients');
        }

        const byPatient = new Map();
        (data.data || []).forEach((item) => {
          if (!byPatient.has(item.patient_id)) {
            byPatient.set(item.patient_id, {
              id: item.patient_id,
              name: item.patient_name,
              phone: item.patient_phone,
              lastVisit: item.appointment_date,
              status: item.status
            });
          }
        });

        setPatients(Array.from(byPatient.values()));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [navigate]);

  return (
    <div className="mc-doctor-patients">
      <DoctorSidebar />
      <main className="mc-doctor-patients__content">
        <header className="mc-doctor-patients__header">
          <h1>Patients</h1>
          <p>Review your active patient list and recent consultations.</p>
        </header>

        <section className="mc-doctor-patients__card">
          <div className="mc-doctor-patients__list">
            {loading && <p>Loading patients...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && patients.length === 0 && <p>No patient records yet.</p>}
            {!loading && !error && patients.map((patient) => (
              <div key={patient.id} className="mc-doctor-patients__item">
                <div>
                  <p className="mc-doctor-patients__name">{patient.name}</p>
                  <span className="mc-doctor-patients__meta">Phone: {patient.phone || 'N/A'}</span>
                </div>
                <span className="mc-doctor-patients__tag">Status: {patient.status}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorPatientsPage;
