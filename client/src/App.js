import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Компоненты
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Страницы
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTable from './pages/CreateTable';
import EditTable from './pages/EditTable';
import TableView from './pages/TableView';
import PublicTables from './pages/PublicTables';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Контекст
import { AuthProvider } from './utils/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/tables/create" element={<PrivateRoute><CreateTable /></PrivateRoute>} />
            <Route path="/tables/edit/:id" element={<PrivateRoute><EditTable /></PrivateRoute>} />
            <Route path="/tables/:id" element={<TableView />} />
            <Route path="/public-tables" element={<PublicTables />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

// Компонент для защищенных маршрутов
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  return token ? children : <Navigate to="/login" />;
};

export default App; 