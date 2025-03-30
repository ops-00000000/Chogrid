const Table = require('../models/Table');

// @desc    Создание новой таблицы
// @route   POST /api/tables
// @access  Private
exports.createTable = async (req, res) => {
  try {
    const { name, description, isPublic, columns } = req.body;

    // Создание таблицы
    const table = await Table.create({
      name,
      description,
      isPublic,
      columns: columns || [],
      items: [],
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Получение всех таблиц пользователя
// @route   GET /api/tables
// @access  Private
exports.getUserTables = async (req, res) => {
  try {
    const tables = await Table.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Получение всех публичных таблиц
// @route   GET /api/tables/public
// @access  Public
exports.getPublicTables = async (req, res) => {
  try {
    const tables = await Table.find({ isPublic: true });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Получение конкретной таблицы
// @route   GET /api/tables/:id
// @access  Private/Public
exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Таблица не найдена'
      });
    }

    // Проверка доступа: таблица должна быть либо публичной, либо принадлежать пользователю
    if (!table.isPublic && (!req.user || table.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к этой таблице'
      });
    }

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Обновление таблицы
// @route   PUT /api/tables/:id
// @access  Private
exports.updateTable = async (req, res) => {
  try {
    const { name, description, isPublic, columns } = req.body;
    
    let table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Таблица не найдена'
      });
    }

    // Проверка владельца
    if (table.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к обновлению этой таблицы'
      });
    }

    // Обновление базовых полей
    table.name = name || table.name;
    table.description = description !== undefined ? description : table.description;
    table.isPublic = isPublic !== undefined ? isPublic : table.isPublic;
    
    // Обновление колонок, если они предоставлены
    if (columns) {
      table.columns = columns;
    }

    // Сохранение обновленной таблицы
    await table.save();

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Удаление таблицы
// @route   DELETE /api/tables/:id
// @access  Private
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Таблица не найдена'
      });
    }

    // Проверка владельца
    if (table.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к удалению этой таблицы'
      });
    }

    await table.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Добавление объекта в таблицу
// @route   POST /api/tables/:id/items
// @access  Private
exports.addItem = async (req, res) => {
  try {
    const { name, cost, ratings } = req.body;
    
    let table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Таблица не найдена'
      });
    }

    // Проверка владельца
    if (table.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к обновлению этой таблицы'
      });
    }

    // Создание и добавление нового объекта
    const newItem = {
      name,
      cost,
      ratings: new Map(Object.entries(ratings || {})),
      utility: 0 // будет рассчитано перед сохранением
    };

    table.items.push(newItem);
    await table.save();

    res.status(201).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Обновление объекта в таблице
// @route   PUT /api/tables/:id/items/:itemId
// @access  Private
exports.updateItem = async (req, res) => {
  try {
    const { name, cost, ratings } = req.body;
    
    let table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Таблица не найдена'
      });
    }

    // Проверка владельца
    if (table.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к обновлению этой таблицы'
      });
    }

    // Поиск объекта по ID
    const itemIndex = table.items.findIndex(item => item._id.toString() === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Объект не найден в таблице'
      });
    }

    // Обновление объекта
    if (name) table.items[itemIndex].name = name;
    if (cost !== undefined) table.items[itemIndex].cost = cost;
    
    if (ratings) {
      // Обновление рейтингов
      const ratingMap = table.items[itemIndex].ratings;
      Object.entries(ratings).forEach(([key, value]) => {
        ratingMap.set(key, value);
      });
    }

    await table.save();

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Удаление объекта из таблицы
// @route   DELETE /api/tables/:id/items/:itemId
// @access  Private
exports.deleteItem = async (req, res) => {
  try {
    let table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Таблица не найдена'
      });
    }

    // Проверка владельца
    if (table.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к обновлению этой таблицы'
      });
    }

    // Удаление объекта
    table.items = table.items.filter(item => item._id.toString() !== req.params.itemId);
    
    await table.save();

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 