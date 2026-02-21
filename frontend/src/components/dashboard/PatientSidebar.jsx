import { NavLink, useNavigate } from 'react-router-dom';
import '../../styles/dashboard/PatientSidebar.css';

const PatientSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login?role=patient');
  };

  return (
    <aside className="mc-patient-sidebar">
      <div className="mc-patient-sidebar__brand">
        <span className="mc-patient-sidebar__logo">MC</span>
        <div>
          <p className="mc-patient-sidebar__title">MediConnect</p>
          <p className="mc-patient-sidebar__subtitle">Patient Portal</p>
        </div>
      </div>

      <nav className="mc-patient-sidebar__nav">
        <NavLink to="/dashboard/patient" className="mc-patient-sidebar__link">
          Dashboard
        </NavLink>
        <NavLink to="/dashboard/patient/profile" className="mc-patient-sidebar__link">
          Profile & Settings
        </NavLink>
        <NavLink to="/dashboard/patient/appointments" className="mc-patient-sidebar__link">
          Appointments
        </NavLink>
        <NavLink to="/dashboard/patient/messages" className="mc-patient-sidebar__link">
          Messages
        </NavLink>
        <NavLink to="/doctors" className="mc-patient-sidebar__link">
          Book Appointment
        </NavLink>
      </nav>

      <div className="mc-patient-sidebar__footer">
        <p>Account</p>
        <button type="button" className="mc-patient-sidebar__logout" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
};

export default PatientSidebar;
