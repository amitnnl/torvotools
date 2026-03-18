import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="App font-primary">
      {!isAdminPath && <Navbar />}
      <main>
        <Outlet />
      </main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <WhatsAppWidget />}
    </div>
  );
}

export default App;
