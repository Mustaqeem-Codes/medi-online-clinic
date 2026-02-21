import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/DoctorsPage.css';
import { API_BASE_URL } from '../config/api';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [locationLine, setLocationLine] = useState('');

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/doctors`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load doctors');
        }

        setDoctors(data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load doctors');
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const specialtyOptions = useMemo(() => {
    const options = doctors
      .map((doctor) => doctor.specialty)
      .filter(Boolean)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    return Array.from(new Set(options)).sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const nameFilter = query.trim().toLowerCase();
    const locationFilter = locationLine.trim().toLowerCase();
    const specialtyFilter = specialty.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const doctorName = (doctor.name || '').toLowerCase();
      const doctorSpecialty = (doctor.specialty || '').toLowerCase();
      const locationValue = (doctor.location || '').toLowerCase();

      const matchesName = nameFilter ? doctorName.includes(nameFilter) : true;
      const matchesSpecialty = specialtyFilter
        ? doctorSpecialty === specialtyFilter
        : true;
      const matchesLocationLine = locationFilter ? locationValue.includes(locationFilter) : true;

      return matchesName && matchesSpecialty && matchesLocationLine;
    });
  }, [doctors, query, specialty, locationLine]);

  return (
    <div className="mc-doctors">
      <header className="mc-doctors__hero">
        <div>
          <p className="mc-doctors__eyebrow">Find a Specialist</p>
          <h1 className="mc-doctors__title">Browse trusted doctors near you.</h1>
          <p className="mc-doctors__subtitle">
            Filter by specialty, location, and availability to book your next appointment.
          </p>
        </div>
        <div className="mc-doctors__filters">
          <input
            className="mc-doctors__input"
            placeholder="Search by name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="mc-doctors__select"
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
          >
            <option value="">All specialties</option>
            {specialtyOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <input
            className="mc-doctors__input"
            placeholder="Location or address"
            value={locationLine}
            onChange={(event) => setLocationLine(event.target.value)}
          />
        </div>
      </header>

      {loading && <div className="mc-doctors__state">Loading doctors...</div>}
      {error && <div className="mc-doctors__error">{error}</div>}

      {!loading && !error && (
        <section className="mc-doctors__grid">
          {filteredDoctors.length === 0 ? (
            <div className="mc-doctors__empty">No doctors match your filters.</div>
          ) : (
            filteredDoctors.map((doctor) => (
              <article key={doctor.id} className="mc-doctors__card">
                <div className="mc-doctors__avatar">{doctor.name.slice(0, 2)}</div>
                <div className="mc-doctors__info">
                  <h2>{doctor.name}</h2>
                  <p>{doctor.specialty}</p>
                  <span>{doctor.location || 'Location TBD'}</span>
                </div>
                <div className="mc-doctors__meta">
                  <span>Status: Verified</span>
                </div>
                <Link to={`/doctors/${doctor.id}`} className="mc-doctors__book">
                  View Profile
                </Link>
              </article>
            ))
          )}
        </section>
      )}
    </div>
  );
};

export default DoctorsPage;
