import { useState } from 'react';

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const galleryItems = [
    {
      id: 1,
      title: 'Business Cards',
      description:
        'Professional business card printing with premium quality materials and fast delivery',
      image: '/images/bisnisCrads.jpg',
      category: 'Cards',
    },
    {
      id: 2,
      title: 'Banners',
      description:
        'Large format banner printing for all your marketing needs with vibrant colors',
      image: '/images/banners.jpg',
      category: 'Marketing',
    },
    {
      id: 3,
      title: 'Brochures',
      description:
        'High-quality brochure printing for your business presentations and promotions',
      image: '/images/brosurss.jpg',
      category: 'Marketing',
    },
    {
      id: 4,
      title: 'Stickers',
      description:
        'Custom sticker printing in any shape and size you need for your brand',
      image: '/images/stickers.jpg',
      category: 'Custom',
    },
    {
      id: 5,
      title: 'Posters',
      description:
        'Eye-catching poster printing with brilliant colors and sharp details',
      image: '/images/posters.jpg',
      category: 'Marketing',
    },
    {
      id: 6,
      title: 'T-Shirts',
      description:
        'Custom t-shirt printing with your unique designs and premium fabric',
      image: '/images/tShirts.jpg',
      category: 'Apparel',
    },
  ];

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % galleryItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      prev => (prev - 1 + galleryItems.length) % galleryItems.length,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <style>{`
        .gallery {
          min-height: 100vh;
          background: white;
          padding: 80px 2rem;
          overflow: hidden;
        }

        .gallery-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .gallery-title {
          font-size: 3rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .gallery-title .highlight {
          color: #1E3A8A;
        }

        .gallery-subtitle {
          font-size: 1.1rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        .gallery-slider {
          position: relative;
          max-width: 1000px;
          margin: 0 auto;
        }

        .gallery-slides-wrapper {
          overflow: hidden;
          border-radius: 30px;
        }

        .gallery-slides {
          display: flex;
          transition: transform 0.5s ease-in-out;
        }

        .gallery-slide {
          min-width: 100%;
          display: flex;
          align-items: center;
          gap: 3rem;
          padding: 3rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }

        .gallery-image {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .gallery-image img {
          width: 100%;
          max-width: 400px;
          height: 350px;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s;
        }

        .gallery-image img:hover {
          transform: scale(1.05);
        }

        .gallery-content {
          flex: 1;
        }

        .gallery-category {
          display: inline-block;
          background: #1E3A8A;
          color: white;
          padding: 0.5rem 1.2rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .gallery-item-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .gallery-item-description {
          font-size: 1.125rem;
          color: #64748b;
          line-height: 1.8;
          margin-bottom: 2rem;
        }

        .gallery-button {
          background: #1E3A8A;
          color: white;
          padding: 0.875rem 2rem;
          border-radius: 25px;
          border: none;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
        }

        .gallery-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4);
        }

        .gallery-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
        }

        .gallery-nav-button {
          background: white;
          color: #1E3A8A;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #1E3A8A;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-nav-button:hover {
          background: #1E3A8A;
          color: white;
          transform: scale(1.1);
        }

        .gallery-dots {
          display: flex;
          gap: 0.75rem;
        }

        .gallery-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          padding: 0;
        }

        .gallery-dot.active {
          background: #1E3A8A;
          width: 32px;
          border-radius: 6px;
        }

        @media (max-width: 968px) {
          .gallery {
            padding: 60px 1rem;
          }

          .gallery-title {
            font-size: 2rem;
          }

          .gallery-slide {
            flex-direction: column;
            gap: 2rem;
            padding: 2rem 1.5rem;
          }

          .gallery-item-title {
            font-size: 2rem;
          }

          .gallery-image img {
            max-width: 100%;
            height: 280px;
          }
        }
      `}</style>

      <section id="gallery" className="gallery">
        <div className="gallery-container">
          <div className="gallery-header">
            <h2 className="gallery-title">
              Our <span className="highlight">Gallery</span>
            </h2>
            <p className="gallery-subtitle">
              Explore our wide range of printing services. From business cards
              to custom products, we deliver excellence.
            </p>
          </div>

          <div className="gallery-slider">
            <div className="gallery-slides-wrapper">
              <div
                className="gallery-slides"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {galleryItems.map(item => (
                  <div key={item.id} className="gallery-slide">
                    <div className="gallery-image">
                      <img src={item.image} alt={item.title} />
                    </div>

                    <div className="gallery-content">
                      <span className="gallery-category">{item.category}</span>
                      <h3 className="gallery-item-title">{item.title}</h3>
                      <p className="gallery-item-description">
                        {item.description}
                      </p>
                      <button className="gallery-button">Learn More</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gallery-nav">
              <button className="gallery-nav-button" onClick={prevSlide}>
                ‹
              </button>

              <div className="gallery-dots">
                {galleryItems.map((item, index) => (
                  <button
                    key={item.id}
                    className={`gallery-dot ${index === currentIndex ? 'active' : ''
                      }`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>

              <button className="gallery-nav-button" onClick={nextSlide}>
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Gallery;