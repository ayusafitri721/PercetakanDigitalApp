const Contact = () => {
  return (
    <>
      <style>{`
        .contact {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 80px 2rem;
          position: relative;
          overflow: hidden;
        }

        .contact::before {
          content: '';
          position: absolute;
          top: -10%;
          right: -5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(30, 58, 138, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .contact::after {
          content: '';
          position: absolute;
          bottom: -10%;
          left: -5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .contact-title {
          font-size: 3rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .contact-title .highlight {
          color: #1E3A8A;
        }

        .contact-subtitle {
          font-size: 1.1rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: start;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .contact-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .contact-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(30, 58, 138, 0.15);
        }

        .contact-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #1E3A8A 0%, #3b82f6 100%);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .contact-icon svg {
          width: 28px;
          height: 28px;
        }

        .contact-details h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .contact-details p {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.6;
        }

        .contact-form {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 0.875rem 1.25rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          color: #1e293b;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #1E3A8A;
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-button {
          width: 100%;
          background: linear-gradient(135deg, #1E3A8A 0%, #3b82f6 100%);
          color: white;
          padding: 1rem;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
        }

        .form-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4);
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .social-icon {
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          color: #1E3A8A;
        }

        .social-icon svg {
          width: 24px;
          height: 24px;
        }

        .social-icon:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(30, 58, 138, 0.2);
          background: linear-gradient(135deg, #1E3A8A 0%, #3b82f6 100%);
          color: white;
        }

        @media (max-width: 968px) {
          .contact {
            padding: 60px 1rem;
          }

          .contact-title {
            font-size: 2rem;
          }

          .contact-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .contact-form {
            padding: 2rem;
          }
        }
      `}</style>

      <section id="contact" className="contact">
        <div className="contact-container">
          <div className="contact-header">
            <h2 className="contact-title">
              Get in <span className="highlight">Touch</span>
            </h2>
            <p className="contact-subtitle">
              Contact us for free consultation or inquiries about our digital
              printing services
            </p>
          </div>

          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>
                    info@printygo.com
                    <br />
                    support@printygo.com
                  </p>
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Phone</h3>
                  <p>
                    +62 812-3456-7890
                    <br />
                    +62 821-9876-5432
                  </p>
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Address</h3>
                  <p>
                    Jl. Printing Digital No. 123
                    <br />
                    South Jakarta, DKI Jakarta 12345
                  </p>
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Working Hours</h3>
                  <p>
                    Monday - Friday: 08:00 - 18:00
                    <br />
                    Saturday: 09:00 - 15:00
                  </p>
                </div>
              </div>

              <div className="social-links">
                <div className="social-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="social-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="social-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </div>
                <div className="social-icon">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <form>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter your phone"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                <button type="submit" className="form-button">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;