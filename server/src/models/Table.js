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
    required: [true, 'Пожалуйста, укажите вес колонки в процентах'],
    min: 0,
    max: 100,
    validate: {
      validator: function(value) {
        return value >= 0 && value <= 100;
      },
      message: 'Вес должен быть в диапазоне от 0 до 100%'
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
    // Проверка суммы весов - она должна быть близка к 100%
    const totalColumnsWeight = this.columns.reduce((sum, col) => sum + col.weight, 0);
    const weightMultiplier = totalColumnsWeight > 0 ? 100 / totalColumnsWeight : 1;
    
    this.items.forEach(item => {
      let totalUtility = 0;
      
      this.columns.forEach(column => {
        const rating = item.ratings.get(column.name) || 0;
        // Используем процентный вес (приведенный к 100%)
        // и умножаем на оценку (от 0 до 10)
        const normalizedWeight = column.weight * weightMultiplier / 100;
        totalUtility += rating * normalizedWeight;
      });
      
      // Полезность - сумма произведений оценок на нормализованные веса
      item.utility = totalUtility;
    });
  }
  
  next();
});

module.exports = mongoose.model('Table', TableSchema); 