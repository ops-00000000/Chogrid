const mongoose = require('mongoose');

// Схема колонки (характеристики)
const ColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  weight: {
    type: Number,
    default: 1
  }
});

// Схема объекта в таблице
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    default: 0
  },
  characteristics: [{
    name: String,
    value: mongoose.Schema.Types.Mixed
  }],
  utility: {
    type: Number,
    default: 0
  },
  // Добавляем поле для хранения примечаний к объекту
  columnNotes: {
    type: String,
    default: ''
  }
});

// Схема таблицы
const TableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
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
  columns: [ColumnSchema],
  items: [itemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', TableSchema); 