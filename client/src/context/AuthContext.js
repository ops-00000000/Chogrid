import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';

// Создаем контекст аутентификации
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Инициализация аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      console.log('Проверка авторизации, токен:', token ? 'Присутствует' : 'Отсутствует');
      
      if (token) {
        try {
          // Установка заголовка авторизации для всех запросов
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Получение данных пользователя
          const res = await axios.get(`${BASE_URL}/api/auth/me`);
          console.log('Данные пользователя:', res.data);
          
          if (res.data) {
            // Проверяем наличие ID и обеспечиваем его доступность через свойство _id для совместимости
            let userData = res.data;
            
            // Обеспечиваем наличие _id, если имеется только id
            if (userData.id && !userData._id) {
              userData._id = userData.id;
            }
            
            console.log('Подготовленные данные пользователя:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            console.log('Пользователь аутентифицирован:', userData);
          } else {
            console.error('Получены некорректные данные пользователя');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (err) {
          console.error('Ошибка при авторизации:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } else {
        console.log('Пользователь не аутентифицирован (нет токена)');
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Функция для регистрации
  const register = async (userData) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, userData);
      
      console.log('Ответ при регистрации:', res.data);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Обеспечиваем наличие _id, если имеется только id
        let userObject = res.data.user;
        if (userObject.id && !userObject._id) {
          userObject._id = userObject.id;
        }
        
        setUser(userObject);
        setIsAuthenticated(true);
        toast.success('Регистрация успешна!');
        return true;
      }
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      const message = err.response?.data?.message || 'Ошибка при регистрации';
      toast.error(message);
      return false;
    }
  };
  
  // Функция для входа
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      
      console.log('Ответ при входе:', res.data);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Обеспечиваем наличие _id, если имеется только id
        let userObject = res.data.user;
        if (userObject.id && !userObject._id) {
          userObject._id = userObject.id;
        }
        
        console.log('Данные пользователя после входа:', userObject);
        setUser(userObject);
        setIsAuthenticated(true);
        toast.success('Вход выполнен успешно!');
        return true;
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      const message = err.response?.data?.message || 'Неверный логин или пароль';
      toast.error(message);
      return false;
    }
  };
  
  // Функция для выхода
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Выход выполнен успешно!');
  };
  
  // Функция для обновления токена
  const refreshAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get(`${BASE_URL}/api/auth/me`);
        
        if (res.data && res.data._id) {
          setUser(res.data);
          setIsAuthenticated(true);
          console.log('Обновление данных пользователя:', res.data);
          return true;
        }
      } catch (err) {
        console.error('Ошибка при обновлении авторизации:', err);
        return false;
      }
    }
    return false;
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAuthenticated, 
        register, 
        login,
        logout,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 