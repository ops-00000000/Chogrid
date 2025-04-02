const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getTables, 
  getPublicTables, 
  getTable, 
  createTable, 
  updateTable, 
  deleteTable,
  forceDeleteTable,
  addItem,
  updateItem,
  deleteItem,
  saveItemNotes
} = require('../controllers/tableController');
const mongoose = require('mongoose');
const Table = require('../models/table');

// Маршруты для таблиц
router.get('/', auth, getTables);
router.get('/public', getPublicTables);
router.get('/:id', getTable);
router.post('/', auth, createTable);
router.put('/:id', auth, updateTable);
router.delete('/:id', auth, deleteTable);

// Маршруты для объектов в таблицах
router.post('/:id/items', auth, addItem);
router.put('/:id/items/:itemId', auth, updateItem);
router.delete('/:id/items/:itemId', auth, deleteItem);

// Маршрут для сохранения примечаний к характеристикам объекта
router.put('/:id/items/:itemId/save-notes', auth, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { notes } = req.body;
    
    console.log(`Запрос на сохранение примечания для таблицы ${id}, объекта ${itemId}`);
    
    // Проверяем валидность ID таблицы
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный формат ID таблицы' });
    }
    
    // Проверяем валидность ID объекта
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Неверный формат ID объекта' });
    }
    
    // Проверяем существование таблицы
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({ message: 'Таблица не найдена' });
    }
    
    // Проверяем права пользователя на редактирование таблицы
    if (table.author.toString() !== req.user.id && !table.isPublic) {
      return res.status(403).json({ message: 'Нет доступа к таблице' });
    }
    
    // Находим объект в таблице
    const itemIndex = table.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Объект не найден в таблице' });
    }
    
    // Обновляем или создаем примечание
    if (!table.items[itemIndex].columnNotes) {
      table.items[itemIndex].columnNotes = notes;
    } else {
      table.items[itemIndex].columnNotes = notes;
    }
    
    // Сохраняем таблицу
    await table.save();
    
    res.status(200).json({ 
      message: 'Примечание сохранено успешно',
      item: table.items[itemIndex]
    });
  } catch (error) {
    console.error('Ошибка при сохранении примечания:', error);
    res.status(500).json({ message: 'Ошибка при сохранении примечания', error: error.message });
  }
});

// Альтернативный маршрут для примечаний, использующий другой путь
router.put('/:id/items/:itemId/notes', auth, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { notes } = req.body;
    
    console.log(`Запрос на сохранение примечания через /notes для таблицы ${id}, объекта ${itemId}`);
    
    // Проверяем валидность ID таблицы
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный формат ID таблицы' });
    }
    
    // Проверяем валидность ID объекта
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Неверный формат ID объекта' });
    }
    
    // Проверяем существование таблицы
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({ message: 'Таблица не найдена' });
    }
    
    // Проверяем права пользователя на редактирование таблицы
    if (table.author.toString() !== req.user.id && !table.isPublic) {
      return res.status(403).json({ message: 'Нет доступа к таблице' });
    }
    
    // Находим объект в таблице
    const itemIndex = table.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Объект не найден в таблице' });
    }
    
    // Обновляем или создаем примечание
    if (!table.items[itemIndex].columnNotes) {
      table.items[itemIndex].columnNotes = notes;
    } else {
      table.items[itemIndex].columnNotes = notes;
    }
    
    // Сохраняем таблицу
    await table.save();
    
    res.status(200).json({ 
      message: 'Примечание сохранено успешно',
      item: table.items[itemIndex]
    });
  } catch (error) {
    console.error('Ошибка при сохранении примечания:', error);
    res.status(500).json({ message: 'Ошибка при сохранении примечания', error: error.message });
  }
});

// Маршрут для удаления таблицы через метод POST
router.post('/:id/delete', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Запрос на удаление таблицы ${id} через POST метод`);
    
    // Проверяем валидность ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный формат ID таблицы' });
    }
    
    // Находим таблицу
    const table = await Table.findById(id);
    
    // Проверяем существование таблицы
    if (!table) {
      return res.status(404).json({ message: 'Таблица не найдена' });
    }
    
    // Проверяем права пользователя
    if (table.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав на удаление этой таблицы' });
    }
    
    // Используем deleteOne вместо remove
    const result = await Table.deleteOne({ _id: id });
    
    console.log('Результат удаления таблицы:', result);
    
    res.status(200).json({ 
      message: 'Таблица успешно удалена', 
      result 
    });
  } catch (error) {
    console.error('Ошибка при удалении таблицы через POST:', error);
    res.status(500).json({ message: 'Ошибка при удалении таблицы', error: error.message });
  }
});

// Маршрут для принудительного удаления таблицы
router.post('/:id/forceDelete', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Запрос на принудительное удаление таблицы ${id}`);
    
    // Проверяем валидность ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный формат ID таблицы' });
    }
    
    // Находим таблицу
    const table = await Table.findById(id);
    
    // Проверяем существование таблицы
    if (!table) {
      return res.status(404).json({ message: 'Таблица не найдена' });
    }
    
    // Проверяем права пользователя
    if (table.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав на удаление этой таблицы' });
    }
    
    // Используем findOneAndDelete для надежного удаления
    const result = await Table.findOneAndDelete({ _id: id });
    
    console.log('Результат принудительного удаления таблицы:', result);
    
    res.status(200).json({ 
      message: 'Таблица успешно удалена принудительно', 
      result 
    });
  } catch (error) {
    console.error('Ошибка при принудительном удалении таблицы:', error);
    res.status(500).json({ message: 'Ошибка при принудительном удалении таблицы', error: error.message });
  }
});

// Маршрут для удаления таблицы через URL /remove
router.delete('/:id/remove', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Запрос на удаление таблицы ${id} через /remove`);
    
    // Проверяем валидность ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный формат ID таблицы' });
    }
    
    // Находим таблицу
    const table = await Table.findById(id);
    
    // Проверяем существование таблицы
    if (!table) {
      return res.status(404).json({ message: 'Таблица не найдена' });
    }
    
    // Проверяем права пользователя
    if (table.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав на удаление этой таблицы' });
    }
    
    // Используем deleteOne для удаления
    const result = await Table.deleteOne({ _id: id });
    
    console.log('Результат удаления таблицы через /remove:', result);
    
    res.status(200).json({ 
      message: 'Таблица успешно удалена', 
      result 
    });
  } catch (error) {
    console.error('Ошибка при удалении таблицы через /remove:', error);
    res.status(500).json({ message: 'Ошибка при удалении таблицы', error: error.message });
  }
});

// Маршрут для удаления таблицы через URL /destroy
router.put('/:id/destroy', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Запрос на удаление таблицы ${id} через /destroy`);
    
    // Проверяем валидность ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный формат ID таблицы' });
    }
    
    // Находим таблицу
    const table = await Table.findById(id);
    
    // Проверяем существование таблицы
    if (!table) {
      return res.status(404).json({ message: 'Таблица не найдена' });
    }
    
    // Проверяем права пользователя
    if (table.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав на удаление этой таблицы' });
    }
    
    // Используем findByIdAndDelete для удаления
    const result = await Table.findByIdAndDelete(id);
    
    console.log('Результат удаления таблицы через /destroy:', result);
    
    res.status(200).json({ 
      message: 'Таблица успешно удалена', 
      result 
    });
  } catch (error) {
    console.error('Ошибка при удалении таблицы через /destroy:', error);
    res.status(500).json({ message: 'Ошибка при удалении таблицы', error: error.message });
  }
});

module.exports = router; 