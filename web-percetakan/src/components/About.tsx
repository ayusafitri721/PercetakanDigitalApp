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
      icon: '⚡',
      title: 'Super Fast',
      description: 'Percetakan siap pasang terbang',
      color: '#60a5fa', // Soft Blue
    },
    {
      icon: '💰',
      title: 'Affordable',
      description: 'Harga lebih terjangkau dengan baik',
      color: '#34d399', // Soft Green
    },
    {
      icon: '🌿',
      title: 'Eco-Friendly',
      description: 'Menggunakan tinta ramah lingkungan',
      color: '#a78bfa', // Soft Purple
    },
    {
      icon: '🛡️',
      title: 'Safe & Comfortable',
      description: 'Pengiriman tanpa kontak fisik pokoak aman',
      color: '#fbbf24', // Soft Yellow
    },
  ];

  const styles = {
    section: {
      position: 'relative' as const,
      padding: '80px 24px',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', // Soft Blue Gradient
      overflow: 'hidden',
    },
    background: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      pointerEvents: 'none' as const,
    },
    bgCircle1: {
      position: 'absolute' as const,
      top: '40px',
      left: '40px',
      width: '256px',
      height: '256px',
      background: '#93c5fd',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: 0.3,
    },
    bgCircle2: {
      position: 'absolute' as const,
      bottom: '40px',
      right: '40px',
      width: '384px',
      height: '384px',
      background: '#7dd3fc',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: 0.3,
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      position: 'relative' as const,
      zIndex: 10,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '48px',
      alignItems: 'center',
    },
    imageWrapper: {
      position: 'relative' as const,
    },
    circleContainer: {
      position: 'relative' as const,
      width: '100%',
      maxWidth: '448px',
      margin: '0 auto',
    },
    backgroundPattern: {
      position: 'absolute' as const,
      inset: 0,
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '50%',
      opacity: 0.3,
      zIndex: 1,
    },
    imageContainer: {
      position: 'relative' as const,
      zIndex: 10,
      padding: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    courierImage: {
      width: '100%',
      height: 'auto',
      objectFit: 'contain' as const,
      display: 'block',
    },
    galleryBadge: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      background: '#1E3A8A',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '0.875rem',
      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
    },
    content: {
      color: '#1e293b', // Dark slate for better readability
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '24px',
      lineHeight: '1.2',
      color: '#0f172a', // Very dark slate
    },
    highlight: {
      color: '#1E3A8A', // Navy blue instead of cyan
    },
    description: {
      fontSize: '1.125rem',
      marginBottom: '32px',
      color: '#475569', // Medium slate
      lineHeight: '1.75',
    },
    featuresTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '24px',
      color: '#1e293b',
    },
    featuresList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    featureCard: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0',
    },
    featureIcon: {
      padding: '12px',
      borderRadius: '12px',
      color: 'white',
      flexShrink: 0,
      fontSize: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '48px',
      minHeight: '48px',
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontWeight: '600',
      fontSize: '1.125rem',
      marginBottom: '4px',
      color: '#1e293b',
    },
    featureDescription: {
      color: '#64748b',
      fontSize: '0.875rem',
    },
  };

  return (
    <section id="about" style={styles.section}>
      <div style={styles.background}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
      </div>

      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Left Side - Image */}
          <div style={styles.imageWrapper}>
            <div style={styles.circleContainer}>
              <div style={styles.backgroundPattern}></div>
              <div style={styles.imageContainer}>
                <img
                  src={courierImage}
                  alt="PrintyGo Courier"
                  style={styles.courierImage}
                />
              </div>
            </div>

            <div style={styles.galleryBadge}>Galeri</div>
          </div>

          {/* Right Side - Content */}
          <div style={styles.content}>
            <h2 style={styles.title}>
              What is <span style={styles.highlight}>PrintyGo</span>?
            </h2>

            <p style={styles.description}>
              PrintyGo adalah solusi digital percetakan modern dengan mesin
              canggih untuk hasil cetak presisi tinggi. Dari brosur hingga
              banner, kami menawarkan layanan cepat, ramah lingkungan, dan hemat
              biaya untuk kebutuhan cetak Anda.
            </p>

            <div>
              <h3 style={styles.featuresTitle}>Keunggulan PrintyGo</h3>

              <div style={styles.featuresList}>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    style={styles.featureCard}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow =
                        '0 8px 24px rgba(30, 58, 138, 0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <div
                      style={{
                        ...styles.featureIcon,
                        background: feature.color,
                      }}
                    >
                      {feature.icon}
                    </div>
                    <div style={styles.featureContent}>
                      <h4 style={styles.featureTitle}>{feature.title}</h4>
                      <p style={styles.featureDescription}>
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
  );
};

export default AboutSection;
