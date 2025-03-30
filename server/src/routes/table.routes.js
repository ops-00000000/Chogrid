const express = require('express');
const router = express.Router();
const { 
  createTable,
  getUserTables,
  getPublicTables,
  getTable,
  updateTable,
  deleteTable,
  addItem,
  updateItem,
  deleteItem
} = require('../controllers/table.controller');
const { protect } = require('../middleware/auth');

// Маршруты для таблиц
router.route('/')
  .post(protect, createTable)
  .get(protect, getUserTables);

router.get('/public', getPublicTables);

router.route('/:id')
  .get(getTable)
  .put(protect, updateTable)
  .delete(protect, deleteTable);

// Маршруты для элементов таблицы
router.post('/:id/items', protect, addItem);
router.route('/:id/items/:itemId')
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router; 