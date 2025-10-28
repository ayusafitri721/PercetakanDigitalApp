// import React from 'react';

const Hero = () => {
  return (
    <>
      <style>{`
        .hero {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%);
          padding: 120px 2rem 4rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -20%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, transparent 70%);
          border-radius: 50%;
        }

        .hero::after {
          content: '';
          position: absolute;
          bottom: -30%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(125, 211, 252, 0.3) 0%, transparent 70%);
          border-radius: 50%;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-title .highlight {
          color: #60a5fa;
        }

        .hero-subtitle {
          font-size: 1rem;
          color: #475569;
          max-width: 700px;
          margin: 0 auto 3rem auto;
          line-height: 1.6;
        }

        .hero-image-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .hero-map {
          width: 100%;
          height: auto;
          border-radius: 10px;
        }

        .hero-card {
          position: absolute;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        .hero-card.users {
          top: 10%;
          right: 8%;
        }

        .hero-card.delivery {
          left: 5%;
          top: 35%;
        }

        .hero-card.truck {
          right: 5%;
          top: 50%;
          background: #6366f1;
          color: white;
          padding: 1rem;
        }

        .hero-card.message {
          right: 8%;
          bottom: 15%;
          background: #60a5fa;
          color: white;
          padding: 1.2rem;
        }

        .hero-card.whatsapp {
          left: 8%;
          top: 20%;
          background: #10b981;
          color: white;
          padding: 1rem;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          justify-content: center;
        }

        .card-icon {
          font-size: 1.5rem;
        }

        .card-content h4 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .card-content p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #64748b;
        }

        .hero-card.users .card-content h4 {
          color: #1e293b;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .hero-card.delivery {
          animation-delay: 0.5s;
        }

        .hero-card.truck {
          animation-delay: 1s;
        }

        .hero-card.message {
          animation-delay: 1.5s;
        }

        .hero-card.whatsapp {
          animation-delay: 0.3s;
        }

        @media (max-width: 768px) {
          .hero {
            padding: 100px 1rem 2rem 1rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 0.9rem;
          }

          .hero-card {
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
          }

          .hero-card.whatsapp {
            width: 50px;
            height: 50px;
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

          <div className="hero-image-container">
            <svg
              className="hero-map"
              viewBox="0 0 800 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="dots"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
                </pattern>
              </defs>

              <rect width="800" height="400" fill="url(#dots)" />

              <path
                d="M 150 200 Q 250 150 350 180 T 550 170 T 700 200"
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 100 220 Q 200 280 300 250 T 500 240 T 650 260"
                stroke="#60a5fa"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M 180 180 Q 280 120 380 150 T 580 140 T 720 170"
                stroke="#818cf8"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />

              <circle cx="150" cy="200" r="4" fill="#6366f1" />
              <circle cx="350" cy="180" r="4" fill="#6366f1" />
              <circle cx="550" cy="170" r="4" fill="#6366f1" />
              <circle cx="700" cy="200" r="4" fill="#6366f1" />
            </svg>

            <div className="hero-card users">
              <div className="card-content">
                <h4>+1.600K</h4>
                <p>user around the world</p>
              </div>
            </div>

            <div className="hero-card whatsapp">
              <span className="card-icon">💬</span>
            </div>

            <div className="hero-card delivery">
              <span className="card-icon">📦</span>
              <div className="card-content">
                <h4>Fast Delivery</h4>
                <p>We'll get it to you as soon as possible</p>
              </div>
            </div>

            <div className="hero-card truck">
              <span className="card-icon">🚚</span>
            </div>

            <div className="hero-card message">
              <span className="card-icon">✉️</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
