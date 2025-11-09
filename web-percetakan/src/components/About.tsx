interface AboutSectionProps {
  courierImage?: string;
  backgroundImage?: string;
}

const AboutSection = ({
  courierImage = '/images/courier.png',
  backgroundImage = '/images/background-pattern.png',
}: AboutSectionProps) => {
  const features = [
    {
      id: 1,
      title: 'Fast Turnaround',
      description:
        'Professional printing with industry-leading speed and efficiency',
      image: '/images/fast.jpg',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 2,
      title: 'Cost-Effective',
      description:
        'Competitive pricing with premium quality materials and service',
      image: '/images/money.jpg',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: 3,
      title: 'Eco-Friendly',
      description:
        'Sustainable printing solutions with environmentally safe materials',
      image: '/images/eco.jpg',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      id: 4,
      title: 'Secure & Reliable',
      description:
        'Safe handling and contactless delivery for your peace of mind',
      image: '/images/secure.jpg',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
  ];

  return (
    <>
      <style>{`
        .about-section {
          position: relative;
          padding: 100px 24px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          overflow: hidden;
        }

        .about-bg-circle-1 {
          position: absolute;
          top: 40px;
          left: 40px;
          width: 256px;
          height: 256px;
          background: #93c5fd;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
        }

        .about-bg-circle-2 {
          position: absolute;
          bottom: 40px;
          right: 40px;
          width: 384px;
          height: 384px;
          background: #7dd3fc;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
        }

        .about-container {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .about-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 64px;
          align-items: center;
        }

        .about-image-wrapper {
          position: relative;
        }

        .about-circle-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .about-background-pattern {
          position: absolute;
          inset: 0;
          background-image: url(${backgroundImage});
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          opacity: 0.3;
        }

        .about-image-container {
          position: relative;
          z-index: 10;
          padding: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .about-courier-image {
          width: 100%;
          height: auto;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.1));
        }

        .about-gallery-badge {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 0 8px 24px rgba(30, 58, 138, 0.3);
          letter-spacing: 0.5px;
        }

        .about-content {
          color: #1e293b;
        }

        .about-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 24px;
          line-height: 1.2;
          color: #0f172a;
        }

        .about-highlight {
          color: #1E3A8A;
        }

        .about-description {
          font-size: 1.125rem;
          margin-bottom: 48px;
          color: #475569;
          line-height: 1.8;
        }

        .about-features-title {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 32px;
          color: #1e293b;
        }

        .about-features-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .about-feature-card {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          background: white;
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .about-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          border-color: transparent;
        }

        .about-feature-icon {
          padding: 16px;
          border-radius: 20px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 64px;
          min-height: 64px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .about-feature-image {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .about-feature-content {
          flex: 1;
        }

        .about-feature-title {
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 8px;
          color: #1e293b;
        }

        .about-feature-description {
          color: #64748b;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .about-section {
            padding: 60px 16px;
          }

          .about-title {
            font-size: 2rem;
          }

          .about-grid {
            gap: 40px;
          }

          .about-features-title {
            font-size: 1.5rem;
          }

          .about-feature-card {
            padding: 20px;
          }

          .about-feature-icon {
            min-width: 56px;
            min-height: 56px;
            padding: 12px;
          }

          .about-feature-image {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>

      <section id="about" className="about-section">
        <div className="about-bg-circle-1"></div>
        <div className="about-bg-circle-2"></div>

        <div className="about-container">
          <div className="about-grid">
            <div className="about-image-wrapper">
              <div className="about-circle-container">
                <div className="about-background-pattern"></div>
                <div className="about-image-container">
                  <img
                    src={courierImage}
                    alt="PrintyGo Professional Service"
                    className="about-courier-image"
                  />
                </div>
              </div>
            </div>

            <div className="about-content">
              <h2 className="about-title">
                About <span className="about-highlight">PrintyGo</span>
              </h2>

              <p className="about-description">
                PrintyGo is a modern digital printing solution equipped with
                cutting-edge machinery for high-precision results. From
                brochures to banners, we deliver fast, eco-friendly, and
                cost-effective printing services tailored to meet all your
                professional needs.
              </p>

              <div>
                <h3 className="about-features-title">Our Key Advantages</h3>

                <div className="about-features-list">
                  {features.map((feature) => (
                    <div key={feature.id} className="about-feature-card">
                      <div
                        className="about-feature-icon"
                        style={{ background: feature.gradient }}
                      >
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="about-feature-image"
                        />
                      </div>
                      <div className="about-feature-content">
                        <h4 className="about-feature-title">{feature.title}</h4>
                        <p className="about-feature-description">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;