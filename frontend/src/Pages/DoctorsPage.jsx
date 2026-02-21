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
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [locationLine, setLocationLine] = useState('');

  const fallbackDoctors = [
    {
      id: 'demo-1',
      name: 'Dr. Ava Smith',
      specialty: 'Cardiology',
      location: '12 Park Ave, New York, USA',
      is_verified: true,
      is_approved: true
    },
    {
      id: 'demo-2',
      name: 'Dr. Liam Patel',
      specialty: 'Dermatology',
      location: '221 King St, Toronto, Canada',
      is_verified: true,
      is_approved: true
    },
    {
      id: 'demo-3',
      name: 'Dr. Emma Brown',
      specialty: 'Neurology',
      location: '9 Baker St, London, UK',
      is_verified: true,
      is_approved: true
    },
    {
      id: 'demo-4',
      name: 'Dr. Noah Khan',
      specialty: 'General Practice',
      location: '18 MG Road, Mumbai, India',
      is_verified: false,
      is_approved: false
    },
    {
      id: 'demo-5',
      name: 'Dr. Sophia Ali',
      specialty: 'Pediatrics',
      location: '101 Marina Blvd, Dubai, UAE',
      is_verified: true,
      is_approved: true
    }
  ];

  const countries = ['USA', 'Canada', 'UK', 'India', 'UAE'];
  const citiesByCountry = {
    USA: ['New York', 'Los Angeles', 'Chicago'],
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
    UK: ['London', 'Manchester', 'Birmingham'],
    India: ['Mumbai', 'Delhi', 'Bengaluru'],
    UAE: ['Dubai', 'Abu Dhabi', 'Sharjah']
  };
  const cityOptions = country ? citiesByCountry[country] || [] : [];

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

        const incoming = data.data || [];
        setDoctors(incoming.length > 0 ? incoming : fallbackDoctors);
      } catch (err) {
        setError('');
        setDoctors(fallbackDoctors);
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
    const cityFilter = city.trim().toLowerCase();
    const countryFilter = country.trim().toLowerCase();
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
      const matchesCity = cityFilter ? locationValue.includes(cityFilter) : true;
      const matchesCountry = countryFilter ? locationValue.includes(countryFilter) : true;
      const matchesLocationLine = locationFilter ? locationValue.includes(locationFilter) : true;

      return matchesName && matchesSpecialty && matchesCity && matchesCountry && matchesLocationLine;
    });
  }, [doctors, query, specialty, city, country, locationLine]);

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
          <select
            className="mc-doctors__select"
            value={country}
            onChange={(event) => {
              const nextCountry = event.target.value;
              const nextCity = nextCountry ? citiesByCountry[nextCountry]?.[0] || '' : '';
              setCountry(nextCountry);
              setCity(nextCity);
            }}
          >
            <option value="">All countries</option>
            {countries.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            className="mc-doctors__select"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            disabled={!country}
          >
            <option value="">All cities</option>
            {cityOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <input
            className="mc-doctors__input"
            placeholder="Location or address"
            value={locationLine}
            onChange={(event) => setLocationLine(event.target.value)}
          />
          <button className="mc-doctors__cta" type="button">Search</button>
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
                  <span>Status: {doctor.is_approved ? 'Approved' : 'Pending'}</span>
                  <span>Verified: {doctor.is_verified ? 'Yes' : 'No'}</span>
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
