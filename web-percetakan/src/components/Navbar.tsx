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
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          padding: 0.75rem 2rem;
          display: flex;
          align-items: center;
          gap: 3rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
          transition: opacity 0.3s;
        }

        .navbar-logo:hover {
          opacity: 0.9;
        }

        .logo-image {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
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
          transition: all 0.3s;
          cursor: pointer;
          position: relative;
        }

        .navbar-menu a::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: white;
          transition: width 0.3s ease;
        }

        .navbar-menu a:hover {
          opacity: 0.9;
        }

        .navbar-menu a:hover::after {
          width: 100%;
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
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
        }

        .navbar-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
          }

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

          .logo-image {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-container">
          <a className="navbar-logo" onClick={() => scrollToSection('home')}>
            <img
              src="/public/images/Logo-Im.png"
              alt="PrintyGo Logo"
              className="logo-image"
            />
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
