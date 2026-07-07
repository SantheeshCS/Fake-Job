import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar animate-fade-in">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          🛡️ FakeJob<span>Guard</span>
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          </li>
          <li>
            <Link to="/detect" className={`nav-link ${location.pathname === '/detect' ? 'active' : ''}`}>Detect</Link>
          </li>
          <li>
            <Link to="/awareness" className={`nav-link ${location.pathname === '/awareness' ? 'active' : ''}`}>Awareness</Link>
          </li>
          <li>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
