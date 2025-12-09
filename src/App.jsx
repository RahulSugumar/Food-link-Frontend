import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/donor/dashboard" element={<DonorDashboard />} />
        <Route path="/receiver/dashboard" element={<ReceiverDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
