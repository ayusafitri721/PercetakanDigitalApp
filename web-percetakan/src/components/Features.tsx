const Features = () => {
  const features = [
    {
      icon: '⚡',
      title: 'Super Fast Printing',
      description:
        'Hasil cetak berkualitas tinggi dalam waktu singkat dengan mesin modern kami',
      color: '#60a5fa',
    },
    {
      icon: '💰',
      title: 'Affordable Price',
      description: 'Harga terjangkau tanpa mengorbankan kualitas cetakan Anda',
      color: '#34d399',
    },
    {
      icon: '🎨',
      title: 'High Quality',
      description:
        'Kualitas cetak terbaik dengan warna tajam dan detail sempurna',
      color: '#f472b6',
    },
    {
      icon: '🌿',
      title: 'Eco-Friendly',
      description: 'Menggunakan tinta dan bahan yang ramah lingkungan',
      color: '#a78bfa',
    },
    {
      icon: '🚚',
      title: 'Fast Delivery',
      description:
        'Pengiriman cepat ke seluruh Indonesia dengan tracking real-time',
      color: '#fb923c',
    },
    {
      icon: '🛡️',
      title: 'Safe & Secure',
      description:
        'Produk dikemas dengan aman dan dijamin sampai dengan sempurna',
      color: '#fbbf24',
    },
  ];

  return (
    <>
      <style>{`
        .features {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 80px 2rem;
          position: relative;
          overflow: hidden;
        }

        .features::before {
          content: '';
          position: absolute;
          top: -10%;
          right: -5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%);
          border-radius: 50%;
        }

        .features::after {
          content: '';
          position: absolute;
          bottom: -10%;
          left: -5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%);
          border-radius: 50%;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .features-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .features-title {
          font-size: 3rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .features-title .highlight {
          color: #1E3A8A;
        }

        .features-subtitle {
          font-size: 1.1rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 12px 40px rgba(30, 58, 138, 0.15);
          border-color: #1E3A8A;
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }

        .feature-description {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.7;
        }

        .features-cta {
          text-align: center;
          margin-top: 4rem;
        }

        .features-cta-text {
          font-size: 1.25rem;
          color: #475569;
          margin-bottom: 1.5rem;
        }

        .features-cta-button {
          background: #1E3A8A;
          color: white;
          padding: 1rem 3rem;
          border-radius: 30px;
          border: none;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(30, 58, 138, 0.3);
        }

        .features-cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(30, 58, 138, 0.4);
          background: #1e40af;
        }

        @media (max-width: 968px) {
          .features {
            padding: 60px 1rem;
          }

          .features-title {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .feature-card {
            padding: 2rem;
          }
        }
      `}</style>

      <section id="features" className="features">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              Our Amazing <span className="highlight">Features</span>
            </h2>
            <p className="features-subtitle">
              Kami menyediakan berbagai fitur unggulan untuk memberikan
              pengalaman cetak digital terbaik bagi Anda
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: feature.color, color: 'white' }}
                >
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="features-cta">
            <p className="features-cta-text">
              Siap untuk mulai mencetak dengan PrintyGo?
            </p>
            <button className="features-cta-button">Get Started Now</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
