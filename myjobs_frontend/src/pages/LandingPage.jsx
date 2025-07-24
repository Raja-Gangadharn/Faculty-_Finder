import { Link } from 'react-router-dom';
import './LandingPage.css'; // Add custom styles for animations


const LandingPage = () => {
  const stats = [
    { icon: '👤', value: '19K+', label: 'Job Available' },
    { icon: '📝', value: '15K+', label: 'CV Submitted' },
    { icon: '🏢', value: '11K+', label: 'Colleges' },
    { icon: '✅', value: '35+', label: 'Appointed To Job' },
  ];
  const repeatedStats = [...stats, ...stats];
  return (
    <div className="landing-container">
      {/* Modern Navbar */}
      <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 fixed-top">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold fs-4 text-primary">JobPortal</span>
          <div className="d-flex align-items-center">
            <Link to="#" className="nav-link mx-3 hover-effect">News & Resources</Link>
            <Link to="#" className="nav-link mx-3 hover-effect">My Account</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title animate-flip">Welcome to JobPortal</h1>
          <p className="hero-subtitle animate-fade-in-delay">Your Gateway to Academic Opportunities</p>
          <div className="portal-buttons animate-fade-in-left">
            <Link to="/faculty/login" className="portal-btn faculty-hover btn btn-primary px-5 py-3 fs-5">
              I'm Faculty
            </Link>
            <Link to="/recruiter/login" className="portal-btn recruiter-hover btn btn-success px-5 py-3 fs-5">
              I'm Recruiter
            </Link>
          </div>
        </div>
      </section>
      <section className='stats-marquee-wrapper'>
      
        <div className="stats-marquee-track">
        {repeatedStats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div style={{ fontSize: '30px', color: '#2f3542' }}>{stat.icon}</div>
            <h3 style={{ color: '#0d6efd', margin: '10px 0' }}>{stat.value}</h3>
            <p style={{ color: '#57606f' }}>{stat.label}</p>
          </div>
        ))}
        </div>
      
      </section>
      {/* Features Section */}
      {/* Stats Marquee remains above */}

      {/* Call To Action */}
      <section className="cta-section animate-fade-in-right">
        <div className="container">
          <h2>Ready to level up your academic career?</h2>
          <p>Join thousands of faculty members and recruiters already finding the perfect match on JobPortal.</p>
          <Link to="/faculty/register" className="btn btn-light cta-btn me-3">Join as Faculty</Link>
          <Link to="/recruiter/registration" className="btn btn-outline-light cta-btn">Join as Recruiter</Link>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3>For Faculty</h3>
                <p>Access academic opportunities and connect with institutions worldwide</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">🏢</div>
                <h3>For Recruiters</h3>
                <p>Find qualified academic professionals for your institution</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Smart Matching</h3>
                <p>Advanced algorithms to match the right candidates with the right opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};



export default LandingPage;
