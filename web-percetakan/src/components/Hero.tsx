const Hero = () => {
  return (
    <>
      <style>{`
        .hero {
          min-height: 100vh;
          background-image: url('https://media.istockphoto.com/id/1401343922/id/foto/operator-percetakan-wanita.jpg?s=1024x1024&w=is&k=20&c=_RzZW3r8s2608tvOFPY0RZoiVEpFidHhE4yS21Z1tls=');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          padding: 120px 2rem 4rem 2rem;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(59, 130, 246, 0.5) 100%);
          z-index: 1;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .hero-title .highlight {
          color: #60a5fa;
          text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: #e0f2fe;
          max-width: 700px;
          margin: 0 auto 3rem auto;
          line-height: 1.8;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
        }

        .hero-cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          margin-bottom: 4rem;
        }

        .btn {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: white;
          color: #1e3a8a;
          border: none;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 25px rgba(255, 255, 255, 0.4);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-3px);
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 2.5rem 2rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.2);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .stat-label {
          font-size: 1rem;
          color: #e0f2fe;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media (max-width: 768px) {
          .hero {
            padding: 100px 1rem 2rem 1rem;
            background-attachment: scroll;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .hero-cta-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .btn {
            width: 100%;
            max-width: 300px;
          }

          .hero-stats {
            gap: 1.5rem;
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 1.5rem 2rem;
          }

          .stat-number {
            font-size: 2rem;
          }
        }
      `}</style>

      <section className="hero">
        <div className="hero-container">
          <h1 className="hero-title">
            Revolutionizing the <span className="highlight">Future</span> of
            Digital Printing
          </h1>
          <p className="hero-subtitle">
            Dengan kecepatan mesin modern dan harga terjangkau, PrintyGo
            menghadirkan solusi cetak yang lebih cepat, efisien, dan berkualitas
            tinggi untuk semua kebutuhan Anda.
          </p>

          <div className="hero-cta-buttons">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
