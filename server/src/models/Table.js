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
    min: 0
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
    this.items.forEach(item => {
      let totalUtility = 0;
      let totalWeight = 0;
      
      this.columns.forEach(column => {
        const rating = item.ratings.get(column.name) || 0;
        totalUtility += rating * column.weight;
        totalWeight += column.weight;
      });
      
      item.utility = totalWeight > 0 ? totalUtility / totalWeight : 0;
    });
  }
  
  next();
});

module.exports = mongoose.model('Table', TableSchema); 