const mongoose = require('mongoose');

// Схема для пользовательской колонки
const CustomColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Пожалуйста, укажите название колонки'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  weight: {
    type: Number,
    required: [true, 'Пожалуйста, укажите вес колонки'],
    min: 0,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'Вес должен быть положительным числом'
    }
  }
});

// Схема для объекта/строки в таблице
const TableItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Пожалуйста, укажите название объекта'],
    trim: true
  },
  cost: {
    type: Number,
    required: [true, 'Пожалуйста, укажите стоимость'],
    min: 0
  },
  utility: {
    type: Number,
    default: 0
  },
  ratings: {
    type: Map,
    of: Number,
    default: {}
  }
});

// Основная схема таблицы
const TableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Пожалуйста, укажите название таблицы'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  columns: [CustomColumnSchema],
  items: [TableItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Пересчет полезности перед сохранением
TableSchema.pre('save', function(next) {
  // Обновление даты изменения
  this.updatedAt = Date.now();
  
  // Пересчет полезности для каждого объекта
  if (this.isModified('items') || this.isModified('columns')) {
    // Рассчитываем сумму весов для нормализации
    const totalColumnsWeight = this.columns.reduce((sum, col) => sum + col.weight, 0);
    
    this.items.forEach(item => {
      let totalUtility = 0;
      
      this.columns.forEach(column => {
        const rating = item.ratings.get(column.name) || 0;
        // Нормализуем вес и умножаем на оценку
        // Нормализация гарантирует, что сумма весов = 1
        const normalizedWeight = totalColumnsWeight > 0 ? column.weight / totalColumnsWeight : 0;
        totalUtility += rating * normalizedWeight;
      });
      
      // Полезность теперь в диапазоне от 0 до 10 (как и оценки)
      item.utility = totalUtility;
    });
  }
  
  next();
});

module.exports = mongoose.model('Table', TableSchema); 