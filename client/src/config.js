// Конфигурационные параметры приложения

// Базовый URL API
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Настройки для запросов
export const API_TIMEOUT = 15000; // 15 секунд

// Настройки для пагинации
export const DEFAULT_PAGE_SIZE = 10;

// Настройки для анимаций
export const ANIMATION_DURATION = {
  short: 0.2,
  medium: 0.4,
  long: 0.6
};

// Константы для типов таблиц
export const TABLE_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};

// Максимальные лимиты
export const LIMITS = {
  MAX_CRITERIA: 10,
  MAX_OBJECTS: 20
};

// Другие конфигурации
export const APP_NAME = 'Chogrid';
export const APP_VERSION = '1.0.0';
export const ITEMS_PER_PAGE = 10; 