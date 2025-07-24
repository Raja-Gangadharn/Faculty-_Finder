import React from 'react';
import { useLocation } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

function AppContent() {
  const location = useLocation();
  return (
    <>
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
