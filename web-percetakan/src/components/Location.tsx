const Location = () => {
  return (
    <>
      <style>{`
        .location {
          min-height: 100vh;
          background: white;
          padding: 80px 2rem;
          position: relative;
          overflow: hidden;
        }

        .location::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(30, 58, 138, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(30, 58, 138, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .location-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .location-content {
          color: #1e293b;
        }

        .location-badge {
          display: inline-block;
          background: #dbeafe;
          color: #1E3A8A;
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .location-title {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #1e293b;
        }

        .location-description {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #64748b;
          margin-bottom: 2rem;
        }

        .location-button {
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

        .location-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(30, 58, 138, 0.4);
          background: #1e40af;
        }

        .location-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .location-map-container {
          position: relative;
          width: 200px;
          height: 280px;
          background: white;
          border-radius: 30px 30px 30px 30px;
          padding: 1.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .location-map {
          flex: 1;
          background: #e2e8f0;
          border-radius: 15px;
          position: relative;
          overflow: hidden;
        }

        .map-lines {
          position: absolute;
          inset: 0;
        }

        .map-line {
          position: absolute;
          background: #cbd5e1;
          border-radius: 2px;
        }

        .map-line-1 {
          width: 60%;
          height: 3px;
          top: 30%;
          left: 10%;
          transform: rotate(-15deg);
        }

        .map-line-2 {
          width: 50%;
          height: 3px;
          top: 50%;
          left: 25%;
          transform: rotate(20deg);
        }

        .map-line-3 {
          width: 40%;
          height: 3px;
          top: 70%;
          left: 15%;
          transform: rotate(-10deg);
        }

        .map-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
        }

        .map-dot-1 {
          top: 25%;
          left: 30%;
        }

        .map-dot-2 {
          top: 55%;
          left: 60%;
        }

        .map-dot-3 {
          top: 75%;
          left: 40%;
        }

        .location-pin {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 100px;
          z-index: 10;
        }

        .pin-circle {
          width: 100px;
          height: 100px;
          background: #ef4444;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bounce 2s infinite;
        }

        .pin-inner {
          width: 40px;
          height: 40px;
          background: #1E3A8A;
          border-radius: 50%;
          transform: rotate(45deg);
        }

        @keyframes bounce {
          0%, 100% {
            transform: rotate(-45deg) translateY(0);
          }
          50% {
            transform: rotate(-45deg) translateY(-10px);
          }
        }

        .location-decorative {
          position: absolute;
          width: 300px;
          height: 300px;
          border: 2px dashed rgba(30, 58, 138, 0.2);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @media (max-width: 968px) {
          .location {
            padding: 60px 1rem;
          }

          .location-container {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: right;
          }

          .location-title {
            font-size: 2rem;
          }

          .location-visual {
            justify-content: flex-end;
          }

          .location-badge {
            display: inline-block;
          }
        }
      `}</style>

      <section className="location">
        <div className="location-container">
          <div className="location-content">
            <span className="location-badge">Location</span>
            <h2 className="location-title">
              Be Part of the Printing Future with PrintGo
            </h2>
            <p className="location-description">
              PrintGo adalah solusi digital untuk membantu Anda mengatur seluruh
              proses bisnis percetakan — dari pemesanan, produksi, hingga
              pengiriman. Nikmati kemudahan dalam mengelola pesanan pelanggan,
              stok bahan, keuangan, dan laporan bisnis, semuanya dalam satu
              aplikasi.
            </p>
            <button className="location-button">Kunjungi</button>
          </div>

          <div className="location-visual">
            <div className="location-decorative"></div>
            <div className="location-map-container">
              <div className="location-pin">
                <div className="pin-circle">
                  <div className="pin-inner"></div>
                </div>
              </div>
              <div className="location-map">
                <div className="map-lines">
                  <div className="map-line map-line-1"></div>
                  <div className="map-line map-line-2"></div>
                  <div className="map-line map-line-3"></div>
                  <div className="map-dot map-dot-1"></div>
                  <div className="map-dot map-dot-2"></div>
                  <div className="map-dot map-dot-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Location;
