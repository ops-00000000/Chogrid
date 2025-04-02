const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const os = require('os'); // Добавляем модуль os для получения сетевых интерфейсов

// Загрузка переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Определение маршрутов
const authRoutes = require('./routes/auth.routes');
const tableRoutes = require('./routes/table.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('API запущен и работает');
});

// Функция для получения всех IP-адресов машины
function getServerIPs() {
  const interfaces = os.networkInterfaces();
  const ipAddresses = [];
  
  Object.keys(interfaces).forEach((interfaceName) => {
    // Пропускаем локальный интерфейс
    if (interfaceName.toLowerCase().includes('lo')) return;
    
    const addresses = interfaces[interfaceName];
    
    addresses.forEach((address) => {
      // Берем только IPv4 адреса
      if (address.family === 'IPv4' || address.family === 4) {
        ipAddresses.push({
          interface: interfaceName,
          ip: address.address,
          isVPN: interfaceName.toLowerCase().includes('tun') || 
                 interfaceName.toLowerCase().includes('vpn') ||
                 interfaceName.toLowerCase().includes('tap')
        });
      }
    });
  });
  
  return ipAddresses;
}

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Определение порта
const PORT = process.env.PORT || 5000;

// Подключение к базе данных и запуск сервера
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      
      // Выводим информацию о доступных IP-адресах
      const ipAddresses = getServerIPs();
      
      if (ipAddresses.length > 0) {
        console.log('Сервер доступен по следующим адресам:');
        ipAddresses.forEach(({ interface, ip, isVPN }) => {
          console.log(`${isVPN ? '[VPN] ' : ''}${interface}: http://${ip}:${PORT}`);
        });
      } else {
        console.log('Не найдены сетевые интерфейсы для отображения адресов');
      }
      
      // Информация для локального доступа
      console.log(`Локальный доступ: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Ошибка подключения к базе данных:', err.message);
  }); 