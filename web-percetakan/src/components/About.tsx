import { Zap, DollarSign, Leaf, Shield } from 'lucide-react';

interface AboutSectionProps {
  courierImage?: string;
}

const AboutSection = ({
  courierImage = '/images/courier.png',
}: AboutSectionProps) => {
  const features = [
    {
      id: 1,
      title: 'Fast Turnaround',
      description:
        'Professional printing with industry-leading speed and efficiency',
      icon: Zap,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 2,
      title: 'Cost-Effective',
      description:
        'Competitive pricing with premium quality materials and service',
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: 3,
      title: 'Eco-Friendly',
      description:
        'Sustainable printing solutions with environmentally safe materials',
      icon: Leaf,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      id: 4,
      title: 'Secure & Reliable',
      description:
        'Safe handling and contactless delivery for your peace of mind',
      icon: Shield,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
  ];

  return (
    <>
      <style>{`
        .about-section {
          position: relative;
          padding: 80px 24px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          overflow: hidden;
        }

        .about-bg-circle-1 {
          position: absolute;
          top: 40px;
          left: 40px;
          width: 200px;
          height: 200px;
          background: #93c5fd;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.3;
        }

        .about-bg-circle-2 {
          position: absolute;
          bottom: 40px;
          right: 40px;
          width: 300px;
          height: 300px;
          background: #7dd3fc;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.3;
        }

        .about-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .about-image-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .about-courier-image {
          width: 100%;
          max-width: 450px;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
        }

        .about-content {
          color: #1e293b;
        }

        .about-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.2;
          color: #0f172a;
        }

        .about-highlight {
          color: #1E3A8A;
        }

        .about-description {
          font-size: 1rem;
          margin-bottom: 40px;
          color: #475569;
          line-height: 1.7;
        }

        .about-features-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 24px;
          color: #1e293b;
        }

        .about-features-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .about-feature-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .about-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          border-color: transparent;
        }

        .about-feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .about-feature-icon svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        .about-feature-title {
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 6px;
          color: #1e293b;
        }

        .about-feature-description {
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        @media (max-width: 968px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .about-features-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .about-section {
            padding: 60px 16px;
          }

          .about-title {
            font-size: 2rem;
          }

          .about-features-title {
            font-size: 1.25rem;
          }

          .about-courier-image {
            max-width: 300px;
          }
        }
      `}</style>

      <section id="about" className="about-section">
        <div className="about-bg-circle-1"></div>
        <div className="about-bg-circle-2"></div>

        <div className="about-container">
          <div className="about-grid">
            <div className="about-image-wrapper">
              <img
                src={courierImage}
                alt="PrintyGo Professional Service"
                className="about-courier-image"
              />
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
                  {features.map(feature => {
                    const IconComponent = feature.icon;
                    return (
                      <div key={feature.id} className="about-feature-card">
                        <div
                          className="about-feature-icon"
                          style={{ background: feature.gradient }}
                        >
                          <IconComponent />
                        </div>
                        <h4 className="about-feature-title">{feature.title}</h4>
                        <p className="about-feature-description">
                          {feature.description}
                        </p>
                      </div>
                    );
                  })}
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
