const Footer = () => {
  return (
    <>
      <style>{`
        .footer {
          background: #1E3A8A;
          color: white;
          padding: 4rem 2rem 2rem 2rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .footer-about {
          max-width: 350px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .footer-logo-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .footer-description {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #bfdbfe;
          margin-bottom: 1.5rem;
        }

        .footer-social {
          display: flex;
          gap: 0.75rem;
        }

        .footer-social-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .footer-social-icon:hover {
          background: white;
          transform: translateY(-3px);
        }

        .footer-column h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 0.875rem;
        }

        .footer-links a {
          color: #bfdbfe;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .footer-links a:hover {
          color: white;
          transform: translateX(5px);
        }

        .footer-bottom {
          padding-top: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #bfdbfe;
        }

        .footer-copyright {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-links-bottom {
          display: flex;
          gap: 2rem;
        }

        .footer-links-bottom a {
          color: #bfdbfe;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-links-bottom a:hover {
          color: white;
        }

        @media (max-width: 968px) {
          .footer {
            padding: 3rem 1rem 1.5rem 1rem;
          }

          .footer-main {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-about {
            max-width: 100%;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .footer-links-bottom {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-about">
              <div className="footer-logo">
                <span className="footer-logo-icon">🎨</span>
                <span>PrintyGo</span>
              </div>
              <p className="footer-description">
                Solusi digital percetakan modern dengan teknologi terkini. Kami
                menghadirkan layanan cetak berkualitas tinggi untuk semua
                kebutuhan bisnis Anda.
              </p>
              <div className="footer-social">
                <div className="footer-social-icon">📘</div>
                <div className="footer-social-icon">📷</div>
                <div className="footer-social-icon">🐦</div>
                <div className="footer-social-icon">💼</div>
              </div>
            </div>

            <div className="footer-column">
              <h3>Company</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Our Team</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Services</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">Business Cards</a>
                </li>
                <li>
                  <a href="#">Banners</a>
                </li>
                <li>
                  <a href="#">Brochures</a>
                </li>
                <li>
                  <a href="#">Custom Printing</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Support</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">Help Center</a>
                </li>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <a href="#">Shipping Info</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              <span>© 2025 PrintyGo.</span>
              <span>All rights reserved.</span>
            </div>
            <div className="footer-links-bottom">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
