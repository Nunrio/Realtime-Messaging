import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MessagingPage from './pages/MessagingPage';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/layout/SidebarLayout';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={isAuthPage ? 'min-h-screen' : 'min-h-screen'}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <MessagingPage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages/groups" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <MessagingPage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages/archive" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <MessagingPage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages/:groupId" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <MessagingPage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/messages" replace />} />
      </Routes>
    </div>
  );
}

export default App;

