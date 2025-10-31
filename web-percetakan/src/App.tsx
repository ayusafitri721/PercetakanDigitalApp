import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard/Dashboard';
import KasirDashboard from './pages/dashboard/kasir/KasirDashboard';
import OperatorDashboard from './pages/dashboard/operator/Dashboard'; // ✅ TAMBAH INI
import UsersManagement from './pages/users/UsersManagement';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import AboutSection from './components/About';
import Features from './components/Features';
import Location from './components/Location';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './pages/users/UserForm';
import './pages/users/UserDelete';
import './pages/products/ProductForm';
import './pages/products/ProductDelete';
import './pages/materials/MaterialForm';
import './pages/materials/MaterialDelete';
import './pages/orders/OrderForm';
import './pages/orders/OrderDetail';
import './pages/reports/ReportList';
import './pages/reports/SalesReport';
import './pages/reports/StockReport';
import './pages/reports/FinanceReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <Navbar />
              <Hero />
              <AboutSection />
              <Gallery />
              <Features/>
              <Location/>
              <Contact />
              <Footer />
            </div>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/kasir" element={<KasirDashboard />} />
        <Route
          path="/dashboard/operator"
          element={<OperatorDashboard />}
        />{' '}
        {/* ✅ TAMBAH INI */}
        <Route path="/users" element={<UsersManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
