import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавление токена авторизации к каждому запросу
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Добавление токена к запросу:', config.method.toUpperCase(), config.url);
    } else {
      console.log('Запрос без токена:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  error => {
    console.error('Ошибка при настройке запроса:', error);
    return Promise.reject(error);
  }
);

// Обработка ошибок ответа
api.interceptors.response.use(
  response => {
    console.log('Успешный ответ от API:', response.config.method.toUpperCase(), response.config.url);
    return response;
  },
  error => {
    if (error.response) {
      console.error('Ошибка ответа API:', error.config.method.toUpperCase(), error.config.url, error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Если сервер вернул 401 (unauthorized), значит токен истек или недействителен
        console.error('Ошибка авторизации 401. Удаление токена.');
        localStorage.removeItem('token');
        // В реальном приложении здесь может быть редирект на страницу логина
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('Нет ответа от сервера:', error.config.method.toUpperCase(), error.config.url);
    } else {
      console.error('Ошибка настройки запроса:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 