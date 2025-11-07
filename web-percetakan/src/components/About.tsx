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
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z" />
        </svg>
      ),
      title: 'Fast Turnaround',
      description:
        'Professional printing with industry-leading speed and efficiency',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
        </svg>
      ),
      title: 'Cost-Effective',
      description:
        'Competitive pricing with premium quality materials and service',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.30C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
        </svg>
      ),
      title: 'Eco-Friendly',
      description:
        'Sustainable printing solutions with environmentally safe materials',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      ),
      title: 'Secure & Reliable',
      description:
        'Safe handling and contactless delivery for your peace of mind',
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
          border-radius: 16px;
          color: white;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 56px;
          min-height: 56px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
            min-width: 48px;
            min-height: 48px;
            padding: 12px;
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
                  {features.map((feature, index) => (
                    <div key={index} className="about-feature-card">
                      <div
                        className="about-feature-icon"
                        style={{ background: feature.gradient }}
                      >
                        {feature.icon}
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