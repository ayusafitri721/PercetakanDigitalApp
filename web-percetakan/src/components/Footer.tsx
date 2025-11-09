const Footer = () => {
  return (
    <>
      <style>{`
        .footer {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          color: white;
          padding: 4rem 2rem 2rem 2rem;
          position: relative;
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
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1E3A8A;
        }

        .footer-logo-icon svg {
          width: 24px;
          height: 24px;
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
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .footer-social-icon svg {
          width: 20px;
          height: 20px;
        }

        .footer-social-icon:hover {
          background: white;
          color: #1E3A8A;
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
                <span className="footer-logo-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </span>
                <span>PrintyGo</span>
              </div>
              <p className="footer-description">
                Modern digital printing solutions with cutting-edge technology.
                We deliver high-quality printing services for all your business
                needs.
              </p>
              <div className="footer-social">
                <div className="footer-social-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="footer-social-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="footer-social-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </div>
                <div className="footer-social-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
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