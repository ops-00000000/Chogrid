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
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Обработка ошибок ответа
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Если сервер вернул 401 (unauthorized), значит токен истек или недействителен
      localStorage.removeItem('token');
      // В реальном приложении здесь может быть редирект на страницу логина
    }
    return Promise.reject(error);
  }
);

export default api; 