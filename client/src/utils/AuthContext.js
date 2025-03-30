import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка пользователя при старте приложения
  useEffect(() => {
    loadUser();
  }, []);

  // Функция для загрузки текущего пользователя
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Запрос профиля пользователя
      const response = await api.get('/auth/me');
      
      setUser(response.data.data);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError(err.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  // Функция для регистрации пользователя
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция для входа пользователя
  const login = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', userData);
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция для выхода
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Функция для запроса сброса пароля
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/forgotpassword', { email });
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при запросе сброса пароля');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция для сброса пароля
  const resetPassword = async (password, resetToken) => {
    try {
      setLoading(true);
      const response = await api.put(`/auth/resetpassword/${resetToken}`, { password });
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при сбросе пароля');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 