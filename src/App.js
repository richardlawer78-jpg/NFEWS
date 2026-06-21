import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import MapView from './pages/Map/MapView';
import Alerts from './pages/Alerts/Alerts';
import Charts from './pages/Charts/Charts';
import Zones from './pages/Zones/Zones';
import Weather from './pages/Weather/Weather';
import Profile from './pages/Profile/Profile';
import Notifications from './pages/Notifications/Notifications';
import AdminPanel from './pages/Admin/Admin';
import Login from './pages/Login/Login';
import Register from './pages/Login/Register';
import ForgotPassword from './pages/Login/ForgotPassword';
import './App.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggle = () => setSidebarOpen(prev => !prev);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        {React.cloneElement(children, { onMenuToggle: toggle })}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute><Layout><MapView /></Layout></ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute><Layout><Alerts /></Layout></ProtectedRoute>
          } />
          <Route path="/charts" element={
            <ProtectedRoute><Layout><Charts /></Layout></ProtectedRoute>
          } />
          <Route path="/zones" element={
            <ProtectedRoute><Layout><Zones /></Layout></ProtectedRoute>
          } />
          <Route path="/weather" element={
            <ProtectedRoute><Layout><Weather /></Layout></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute><Layout><AdminPanel /></Layout></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
