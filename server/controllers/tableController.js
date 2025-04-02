const Table = require('../models/Table');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// @desc    Получить все таблицы
// @route   GET /api/tables
// @access  Private
const getTables = asyncHandler(async (req, res) => {
  // Получаем таблицы текущего пользователя
  const tables = await Table.find({ user: req.user.id });
  
  res.json({
    success: true,
    count: tables.length,
    data: tables
  });
});

// @desc    Получить публичные таблицы
// @route   GET /api/tables/public
// @access  Public
const getPublicTables = asyncHandler(async (req, res) => {
  // Получаем все публичные таблицы
  const tables = await Table.find({ isPublic: true });
  
  res.json({
    success: true,
    count: tables.length,
    data: tables
  });
});

// @desc    Получить одну таблицу
// @route   GET /api/tables/:id
// @access  Private/Public
const getTable = asyncHandler(async (req, res) => {
  // Проверяем валидность ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }

  const table = await Table.findById(req.params.id);
  
  if (!table) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }
  
  // Если таблица приватная и не принадлежит текущему пользователю
  if (!table.isPublic && (!req.user || table.user.toString() !== req.user.id)) {
    res.status(403);
    throw new Error('Доступ запрещен');
  }
  
  res.json({
    success: true,
    data: table
  });
});

// @desc    Создать таблицу
// @route   POST /api/tables
// @access  Private
const createTable = asyncHandler(async (req, res) => {
  const { name, description, isPublic, columns } = req.body;
  
  if (!name) {
    res.status(400);
    throw new Error('Укажите имя таблицы');
  }
  
  const table = await Table.create({
    name,
    description,
    isPublic: isPublic || false,
    columns: columns || [],
    user: req.user.id
  });
  
  res.status(201).json({
    success: true,
    data: table
  });
});

// @desc    Обновить таблицу
// @route   PUT /api/tables/:id
// @access  Private
const updateTable = asyncHandler(async (req, res) => {
  // Проверяем валидность ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }

  const table = await Table.findById(req.params.id);
  
  if (!table) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }
  
  // Проверяем права доступа
  if (table.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Нет прав на редактирование таблицы');
  }
  
  const updatedTable = await Table.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.json({
    success: true,
    data: updatedTable
  });
});

// @desc    Удалить таблицу
// @route   DELETE /api/tables/:id
// @access  Private
const deleteTable = asyncHandler(async (req, res) => {
  console.log('Запрос на удаление таблицы через контроллер deleteTable');

  // Проверяем валидность ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }

  const table = await Table.findById(req.params.id);
  
  if (!table) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }
  
  // Проверяем права доступа
  if (table.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Нет прав на удаление таблицы');
  }
  
  // Используем findByIdAndDelete вместо .remove()
  await Table.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Таблица удалена',
    data: {}
  });
});

// @desc    Удалить таблицу альтернативным методом
// @route   POST /api/tables/:id/forceDelete
// @access  Private
const forceDeleteTable = asyncHandler(async (req, res) => {
  console.log('Запрос на принудительное удаление таблицы');

  // Проверяем валидность ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }

  const table = await Table.findById(req.params.id);
  
  if (!table) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }
  
  // Проверяем права доступа
  if (table.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Нет прав на удаление таблицы');
  }
  
  // Используем deleteOne для удаления документа
  await Table.deleteOne({ _id: req.params.id });
  
  res.json({
    success: true,
    message: 'Таблица удалена принудительно',
    data: {}
  });
});

// @desc    Добавить объект в таблицу
// @route   POST /api/tables/:id/items
// @access  Private
const addItem = asyncHandler(async (req, res) => {
  // Проверяем валидность ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }

  const table = await Table.findById(req.params.id);
  
  if (!table) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }
  
  // Проверяем права доступа
  if (table.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Нет прав на редактирование таблицы');
  }
  
  // Создаем новый объект
  const item = {
    name: req.body.name,
    cost: req.body.cost,
    description: req.body.description,
    ratings: req.body.ratings || {},
    utility: req.body.utility || 0
  };
  
  // Добавляем объект в таблицу
  table.items.push(item);
  
  // Сохраняем таблицу
  await table.save();
  
  // Находим и возвращаем добавленный объект
  const addedItem = table.items[table.items.length - 1];
  
  res.status(201).json({
    success: true,
    data: addedItem
  });
});

// @desc    Обновить объект в таблице
// @route   PUT /api/tables/:id/items/:itemId
// @access  Private
const updateItem = asyncHandler(async (req, res) => {
  // Проверяем валидность ID таблицы
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }

  const table = await Table.findById(req.params.id);
  
  if (!table) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }
  
  // Проверяем права доступа
  if (table.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Нет прав на редактирование таблицы');
  }
  
  // Находим объект в таблице
  const itemIndex = table.items.findIndex(item => 
    item._id.toString() === req.params.itemId
  );
  
  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Объект не найден');
  }
  
  // Обновляем поля объекта
  Object.keys(req.body).forEach(key => {
    if (key === 'ratings' && req.body.ratings) {
      // Обрабатываем ratings отдельно
      table.items[itemIndex].ratings = {
        ...table.items[itemIndex].ratings,
        ...req.body.ratings
      };
    } else {
      table.items[itemIndex][key] = req.body[key];
    }
  });
  
  // Сохраняем таблицу
  await table.save();
  
  res.json({
    success: true,
    data: table.items[itemIndex]
  });
});

// @desc    Удалить объект из таблицы
// @route   DELETE /api/tables/:id/items/:itemId
// @access  Private
const deleteItem = asyncHandler(async (req, res) => {
  // Проверяем валидность ID таблицы
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }

  const table = await Table.findById(req.params.id);
  
  if (!table) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }
  
  // Проверяем права доступа
  if (table.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Нет прав на редактирование таблицы');
  }
  
  // Находим и удаляем объект
  table.items = table.items.filter(
    item => item._id.toString() !== req.params.itemId
  );
  
  // Сохраняем таблицу
  await table.save();
  
  res.json({
    success: true,
    message: 'Объект удален',
    data: {}
  });
});

// @desc   Сохранить примечания к характеристикам объекта
// @route  PUT /api/tables/:id/items/:itemId/notes
// @access Private
const saveItemNotes = asyncHandler(async (req, res) => {
  // Проверяем валидность ID таблицы
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }

  const table = await Table.findById(req.params.id);
  
  if (!table) {
    res.status(404);
    throw new Error('Таблица не найдена');
  }
  
  // Проверяем права доступа
  if (table.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Нет прав на редактирование таблицы');
  }
  
  // Находим объект в таблице
  const itemIndex = table.items.findIndex(item => 
    item._id.toString() === req.params.itemId
  );
  
  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Объект не найден');
  }
  
  // Проверяем наличие примечаний в запросе
  if (!req.body.columnNotes) {
    res.status(400);
    throw new Error('Отсутствуют данные примечаний');
  }
  
  // Сохраняем примечания к характеристикам
  table.items[itemIndex].columnNotes = req.body.columnNotes;
  
  // Сохраняем таблицу
  await table.save();
  
  res.json({
    success: true,
    message: 'Примечания сохранены',
    data: table.items[itemIndex]
  });
});

module.exports = {
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
}; 