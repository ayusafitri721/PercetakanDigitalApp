import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .navbar-container {
          background: #1E3A8A;
          backdrop-filter: blur(10px);
          border-radius: 50px;
          padding: 0.75rem 2rem;
          display: flex;
          align-items: center;
          gap: 3rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          max-width: 900px;
          width: 100%;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          text-decoration: none;
          cursor: pointer;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .navbar-menu {
          display: flex;
          gap: 2.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
          flex: 1;
          justify-content: center;
        }

        .navbar-menu a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          transition: opacity 0.3s;
          cursor: pointer;
        }

        .navbar-menu a:hover {
          opacity: 0.8;
        }

        .navbar-login {
          background: white;
          color: #1E3A8A;
          padding: 0.6rem 1.8rem;
          border-radius: 25px;
          border: none;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .navbar-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .navbar-container {
            gap: 1rem;
            padding: 0.5rem 1rem;
          }

          .navbar-menu {
            display: none;
          }

          .navbar-logo {
            font-size: 1rem;
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-container">
          <a className="navbar-logo" onClick={() => scrollToSection('home')}>
            <span className="logo-icon">🎨</span>
            <span>PrintyGo</span>
          </a>

          <ul className="navbar-menu">
            <li>
              <a onClick={() => scrollToSection('about')}>About</a>
            </li>
            <li>
              <a onClick={() => scrollToSection('gallery')}>Gallery</a>
            </li>
            <li>
              <a onClick={() => scrollToSection('features')}>Features</a>
            </li>
            <li>
              <a onClick={() => scrollToSection('location')}>Location</a>
            </li>
            <li>
              <a onClick={() => scrollToSection('contact')}>Contact</a>
            </li>
          </ul>

          <button className="navbar-login" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
