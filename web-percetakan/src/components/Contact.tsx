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
          background: #1E3A8A;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: white;
          flex-shrink: 0;
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
          background: #1E3A8A;
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
          background: #1e40af;
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
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        .social-icon:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(30, 58, 138, 0.2);
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

      <section className="contact">
        <div className="contact-container">
          <div className="contact-header">
            <h2 className="contact-title">
              Get in <span className="highlight">Touch</span>
            </h2>
            <p className="contact-subtitle">
              Hubungi kami untuk konsultasi gratis atau pertanyaan seputar
              layanan percetakan digital kami
            </p>
          </div>

          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">📧</div>
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
                <div className="contact-icon">📞</div>
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
                <div className="contact-icon">📍</div>
                <div className="contact-details">
                  <h3>Address</h3>
                  <p>
                    Jl. Printing Digital No. 123
                    <br />
                    Jakarta Selatan, DKI Jakarta 12345
                  </p>
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon">🕐</div>
                <div className="contact-details">
                  <h3>Working Hours</h3>
                  <p>
                    Senin - Jumat: 08:00 - 18:00
                    <br />
                    Sabtu: 09:00 - 15:00
                  </p>
                </div>
              </div>

              <div className="social-links">
                <div className="social-icon">📘</div>
                <div className="social-icon">📷</div>
                <div className="social-icon">🐦</div>
                <div className="social-icon">💼</div>
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
