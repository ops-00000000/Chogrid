import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Container,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  alpha,
  Backdrop
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import CalculateIcon from '@mui/icons-material/Calculate';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';

const PageContainer = styled(Container)(({ theme }) => ({
  maxWidth: '100%',
  paddingLeft: 0,
  paddingRight: 0,
  marginBottom: 0,
  paddingBottom: 0,
  minHeight: '100vh'
}));

// Стиль для заголовка страницы
const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  margin: 0,
  borderRadius: 0,
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  width: '100%',
  '& .MuiTypography-root': {
    color: theme.palette.primary.contrastText,
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    '& .MuiIconButton-root': {
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
      }
    }
  },
  '& .MuiButton-root': {
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.contrastText,
    marginLeft: theme.spacing(1),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
      borderColor: theme.palette.primary.contrastText,
    }
  }
}));

// Стиль для контейнера таблицы
const TableBox = styled(Paper)(({ theme }) => ({
  margin: 0,
  padding: 0,
  borderRadius: 0,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  width: '100vw',
  maxWidth: '100vw',
  position: 'relative',
  left: '50%',
  transform: 'translateX(-50%)',
  overflowX: 'auto',
  '& .MuiTableContainer-root': {
    maxHeight: 'calc(100vh - 120px)',
    width: '100%',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.background.default,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.main,
      borderRadius: '4px',
    },
  }
}));

// Стиль для ячейки таблицы с заголовком
const HeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: alpha(theme.palette.primary.main, 0.05)
}));

// Стиль для ячейки таблицы с данными
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  cursor: props => props.editable === 'true' ? 'pointer' : 'default',
  '&:hover': {
    backgroundColor: props => props.editable === 'true' ? alpha(theme.palette.primary.main, 0.05) : 'inherit'
  }
}));

// Стиль для ячейки с примечаниями
const NotesCell = styled(StyledTableCell)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.palette.text.secondary,
  backgroundColor: alpha(theme.palette.info.light, 0.05),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.info.light, 0.1)
  }
}));

// Добавляем константу для хранения примечаний в localStorage
const NOTES_STORAGE_KEY = 'table_notes';

const TableView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshAuth } = useContext(AuthContext);
  const theme = useTheme();

  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  
  // Состояние модального окна и формы
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  
  // Добавляю новые состояния для редактирования
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  // Добавляю состояние для отображения описания колонки при наведении
  const [columnTooltip, setColumnTooltip] = useState(null);
  
  // Добавляем новое состояние для примечаний
  const [notes, setNotes] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Обновляем состояние для хранения примечаний к характеристикам
  const [columnNotes, setColumnNotes] = useState({});
  
  // Отслеживание состояния модального окна
  useEffect(() => {
    console.log('Текущее состояние modalOpen:', modalOpen);
  }, [modalOpen]);

  // Отслеживание состояния данных формы
  useEffect(() => {
    if (modalOpen) {
      console.log('Данные формы:', formData);
      console.log('Ошибки формы:', formErrors);
    }
  }, [formData, formErrors, modalOpen]);

  useEffect(() => {
    // Перед загрузкой таблицы обновляем данные аутентификации
    const initializeTable = async () => {
      try {
        setLoading(true);
        
        // Обновляем данные пользователя для гарантии актуальности токена
        if (localStorage.getItem('token')) {
          await refreshAuth();
        }
        
        // После обновления данных аутентификации загружаем таблицу
        await fetchTable();
      } catch (err) {
        console.error("Ошибка инициализации таблицы:", err);
        setError('Не удалось загрузить таблицу');
      } finally {
        setLoading(false);
      }
    };
    
    initializeTable();
  }, [id, refreshAuth]);

  const fetchTable = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tables/${id}`);
      
      // Логирование ответа для отладки
      console.log('Ответ при загрузке таблицы:', res.data);
      
      // Детальное логирование ответа
      console.log('Полный ответ от сервера:', JSON.stringify(res.data, null, 2));
      
      // Правильно обрабатываем вложенную структуру данных
      let tableData;
      if (res.data && res.data.success === true && res.data.data) {
        console.log('Данные таблицы находятся в res.data.data');
        tableData = res.data.data;
      } else {
        console.log('Данные таблицы находятся непосредственно в res.data');
        tableData = res.data;
      }
      
      console.log('Извлеченные данные таблицы:', tableData);
      
      // Проверка структуры данных перед их использованием
      if (tableData) {
        setTableData(tableData);
        
        // Подробно исследуем элементы, чтобы понять, где хранятся примечания
        if (tableData.items && tableData.items.length > 0) {
          console.log('==== ИССЛЕДОВАНИЕ СТРУКТУРЫ ДАННЫХ ЭЛЕМЕНТОВ ====');
          
          tableData.items.forEach((item, index) => {
            console.log(`Элемент ${index + 1} (${item.name || 'без имени'}):`);
            console.log('- ID:', item._id);
            console.log('- Поля верхнего уровня:', Object.keys(item));
            
            // Проверяем наличие полей с префиксом note_
            const noteFields = Object.keys(item).filter(key => key.startsWith('note_'));
            if (noteFields.length > 0) {
              console.log('- Найдены поля примечаний верхнего уровня:', noteFields);
              noteFields.forEach(field => {
                console.log(`  - ${field}: ${item[field]}`);
              });
            }
            
            // Проверяем ratings
            if (item.ratings) {
              console.log('- Объект ratings содержит поля:', Object.keys(item.ratings));
              
              // Ищем примечания в ratings
              const noteRatings = Object.keys(item.ratings).filter(key => key.startsWith('note_'));
              if (noteRatings.length > 0) {
                console.log('- Найдены примечания в ratings:', noteRatings);
                noteRatings.forEach(field => {
                  console.log(`  - ${field}: ${item.ratings[field]}`);
                });
              }
            }
            
            // Проверяем columnNotes
            if (item.columnNotes) {
              console.log('- Объект columnNotes содержит поля:', Object.keys(item.columnNotes));
            }
            
            // Проверяем notes
            if (item.notes) {
              console.log('- Объект notes содержит поля:', Object.keys(item.notes));
            }
            
            console.log('------------------------------');
          });
          
          console.log('==== КОНЕЦ ИССЛЕДОВАНИЯ ====');
        }
        
        // Загружаем примечания, если они есть в данных
        if (tableData.items) {
          const notesMap = {};
          
          // Обрабатываем примечания для каждого элемента
          tableData.items.forEach(item => {
            if (item.columnNotes) {
              // Перебираем примечания к характеристикам
              Object.keys(item.columnNotes).forEach(key => {
                notesMap[`${item._id}-${key}`] = item.columnNotes[key];
              });
            }
            
            // Также проверяем ratings на наличие полей с префиксом note_
            if (item.ratings) {
              Object.keys(item.ratings).forEach(key => {
                if (key.startsWith('note_')) {
                  const columnId = key.substring(5); // Убираем префикс note_
                  const noteKey = `${item._id}-${columnId}`;
                  notesMap[noteKey] = item.ratings[key];
                }
              });
            }
          });
          
          // Устанавливаем загруженные примечания
          if (Object.keys(notesMap).length > 0) {
            console.log('Загружены примечания к характеристикам:', notesMap);
            setColumnNotes(notesMap);
          }
        }
        
        // Детальное логирование пользователя
        console.log('Текущий пользователь:', user);
        console.log('Детальная структура пользователя:', JSON.stringify(user, null, 2));
        
        // Проверяем, является ли текущий пользователь владельцем таблицы
        // Учитываем, что поле может называться id или _id
        if (user && (user._id || user.id)) {
          // Получаем ID владельца таблицы из данных, учитывая разные возможные структуры
          let tableOwnerId = '';
          
          if (tableData.user) {
            if (typeof tableData.user === 'object') {
              tableOwnerId = String(tableData.user._id || tableData.user.id || '');
              console.log('ID владельца таблицы (из объекта):', tableOwnerId);
            } else {
              tableOwnerId = String(tableData.user || '');
              console.log('ID владельца таблицы (строка):', tableOwnerId);
            }
          }
          
          // Получаем ID текущего пользователя
          const userId = String(user._id || user.id || '');
          
          console.log('ID пользователя:', userId);
          console.log('ID владельца таблицы:', tableOwnerId);
          
          // Проверяем, совпадают ли ID
          const isOwner = tableOwnerId && userId && tableOwnerId === userId;
          console.log('Является ли пользователь владельцем:', isOwner);
          
          setIsOwner(isOwner);
        } else {
          console.log('Нет данных о пользователе или пользователь не аутентифицирован');
          setIsOwner(false);
        }
        
        // Если таблица публичная, отображаем её независимо от владельца
        console.log('Таблица публичная:', tableData.isPublic);
      } else {
        console.error('Получены пустые данные таблицы');
        setError('Данные таблицы отсутствуют');
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching table:', err);
      console.error('Детали ошибки:', err.response ? err.response.data : err.message);
      setError('Не удалось загрузить таблицу');
      toast.error('Ошибка при загрузке таблицы');
    }
  };

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      toast.warning('Необходимо войти в систему для добавления объектов');
      navigate('/login');
      return;
    }
    
    // Создаем пустой объект с полями для каждого критерия
    const initialFormData = {};
    
    if (tableData && tableData.columns) {
      tableData.columns.forEach(column => {
        initialFormData[column._id] = '';
      });
    }
    
    setFormData({
      name: '',
      cost: '',
      description: '',
      ...initialFormData
    });
    setFormErrors({});
    console.log('Открываем модальное окно, setModalOpen(true)');
    setModalOpen(true);
    console.log('Состояние modalOpen после установки:', true);
  };

  const handleCloseModal = () => {
    console.log('Закрываем модальное окно, setModalOpen(false)');
    setModalOpen(false);
    console.log('Состояние modalOpen после установки:', false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Очищаем ошибки при изменении поля
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Название объекта обязательно';
    }
    
    // Убираем обязательную валидацию стоимости
    if (formData.cost && (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0)) {
      errors.cost = 'Стоимость должна быть положительным числом';
    }
    
    // Убираем обязательную валидацию критериев
    if (tableData && tableData.columns) {
      tableData.columns.forEach(column => {
        const value = formData[column._id];
        if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0 || parseFloat(value) > 10)) {
          errors[column._id] = 'Значение должно быть числом от 0 до 10';
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Проверяем аутентификацию
      if (!isAuthenticated) {
        toast.error('Необходимо войти в систему для добавления объектов');
        navigate('/login');
        return;
      }
      
      // Формируем данные для отправки
      const objectData = {
        name: formData.name,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        description: formData.description || '',
        ratings: {}
      };
      
      // Добавляем значения критериев только если они есть
      if (tableData && tableData.columns) {
        tableData.columns.forEach(column => {
          if (formData[column._id]) {
            objectData.ratings[column.name] = parseFloat(formData[column._id]);
          }
        });
      }
      
      console.log('Отправляем данные объекта:', objectData);
      
      // Отправляем запрос на сервер
      const response = await axios.post(`${BASE_URL}/api/tables/${id}/items`, objectData);
      
      console.log('Ответ при добавлении объекта:', response.data);
      
      // Обновляем данные таблицы
      await fetchTable();
      
      // Закрываем модальное окно
      handleCloseModal();
      
      // Показываем уведомление об успешном добавлении
      toast.success('Объект успешно добавлен!');
    } catch (err) {
      console.error('Error adding object:', err);
      console.error('Детали ошибки:', err.response ? err.response.data : err.message);
      
      if (err.response && err.response.status === 401) {
        toast.error('Ошибка авторизации. Пожалуйста, войдите заново');
        navigate('/login');
      } else {
        toast.error('Ошибка при добавлении объекта');
      }
    }
  };

  const handleEditObject = (objectId) => {
    navigate(`/edit-object/${id}/${objectId}`);
  };

  const handleDeleteObject = async (objectId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот объект?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Ошибка авторизации. Пожалуйста, войдите заново');
          navigate('/login');
          return;
        }

        await axios.delete(`${BASE_URL}/api/tables/${id}/items/${objectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Обновляем данные таблицы
        await fetchTable();
        toast.success('Объект успешно удален!');
      } catch (err) {
        console.error('Error deleting object:', err);
        if (err.response && err.response.status === 401) {
          toast.error('Ошибка авторизации. Пожалуйста, войдите заново');
          navigate('/login');
        } else {
          toast.error('Ошибка при удалении объекта');
        }
      }
    }
  };

  // Вычисление полезности объекта
  const getUtility = (item) => {
    if (!item.ratings || !tableData.columns) return 0;
    
    let totalUtility = 0;
    
    // Проверка суммы весов - она должна быть близка к 100%
    const totalColumnsWeight = tableData.columns.reduce((sum, col) => sum + col.weight, 0);
    const weightMultiplier = totalColumnsWeight > 0 ? 100 / totalColumnsWeight : 1;
    
    tableData.columns.forEach(column => {
      const weight = column.weight || 1;
      const rating = item.ratings[column.name];
      
      if (rating !== undefined) {
        // Используем процентный вес (приведенный к 100%)
        const normalizedWeight = weight * weightMultiplier / 100;
        totalUtility += rating * normalizedWeight;
      }
    });
    
    // Полезность - сумма произведений оценок на нормализованные веса
    return totalUtility.toFixed(2);
  };

  // Вычисление соотношения полезности к стоимости
  const getUtilityToCostRatio = (item) => {
    const utility = parseFloat(getUtility(item));
    const cost = item.cost || 1; // Избегаем деления на ноль
    
    if (cost === 0) return "∞"; // Если стоимость равна 0, возвращаем бесконечность
    
    return (utility / cost).toFixed(3);
  };

  // Анимационные варианты
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Функция для обработки начала редактирования ячейки
  const handleCellClick = (itemId, field, currentValue) => {
    // Если пользователь не владелец, не разрешаем редактирование
    if (!isOwner) return;
    
    // Устанавливаем editingCell в формате {itemId, field}
    setEditingCell({itemId, field});
    // Устанавливаем значение для редактирования
    setEditValue(currentValue !== undefined ? currentValue.toString() : '');
  };

  // Функция для обработки изменения значения при редактировании
  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  // Функция для получения примечания, сначала из ratings объекта, затем из локального хранилища
  const getColumnNote = (item, columnName) => {
    if (!item || !item._id) return '';
    
    // Проверяем все возможные места хранения примечаний
    
    // 1. Сначала пробуем получить из ratings объекта
    if (item.ratings && item.ratings[`note_${columnName}`] !== null && item.ratings[`note_${columnName}`] !== undefined) {
      return item.ratings[`note_${columnName}`];
    }
    
    // 2. Проверяем columnNotes
    if (item.columnNotes && item.columnNotes[columnName] !== null && item.columnNotes[columnName] !== undefined) {
      return item.columnNotes[columnName];
    }
    
    // 3. Проверяем notes
    if (item.notes && item.notes[columnName] !== null && item.notes[columnName] !== undefined) {
      return item.notes[columnName];
    }
    
    // 4. Проверяем прямое поле с note_ префиксом
    if (item[`note_${columnName}`] !== null && item[`note_${columnName}`] !== undefined) {
      return item[`note_${columnName}`];
    }
    
    // 5. Пробуем получить из локального хранилища
    try {
      const notesStr = localStorage.getItem(NOTES_STORAGE_KEY);
      if (notesStr) {
        const notes = JSON.parse(notesStr);
        const noteKey = `${item._id}-${columnName}`;
        if (notes[noteKey]) {
          return notes[noteKey];
        }
      }
    } catch (e) {
      console.error('Ошибка при чтении примечаний из localStorage:', e);
    }
    
    return '';
  };

  // Функция для сохранения примечания в localStorage
  const saveNoteToLocalStorage = (itemId, columnName, noteValue) => {
    try {
      // Получаем текущие примечания или создаем новый объект
      const notesStr = localStorage.getItem(NOTES_STORAGE_KEY) || '{}';
      const notes = JSON.parse(notesStr);
      
      // Создаем ключ для примечания
      const noteKey = `${itemId}-${columnName}`;
      
      // Сохраняем примечание
      notes[noteKey] = noteValue;
      
      // Обновляем localStorage
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      
      console.log('Примечание сохранено в localStorage:', { itemId, columnName, noteValue });
      return true;
    } catch (e) {
      console.error('Ошибка при сохранении примечания в localStorage:', e);
      return false;
    }
  };

  // Функция загрузки примечаний из localStorage
  const loadNotesFromLocalStorage = () => {
    try {
      const notesStr = localStorage.getItem(NOTES_STORAGE_KEY);
      if (notesStr) {
        return JSON.parse(notesStr);
      }
    } catch (e) {
      console.error('Ошибка при загрузке примечаний из localStorage:', e);
    }
    return {};
  };

  // Упрощаю функцию handleSaveEdit для примечаний, делая ее идентичной обработке характеристик
  const handleSaveEdit = async (e) => {
    if (e.key === 'Enter' && editingCell) {
      if (e.preventDefault && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      
      try {
        const {itemId, field} = editingCell;
        console.log('Сохраняем правку для поля:', field);
        
        // Получаем элемент из таблицы
        const item = tableData.items.find(i => i._id === itemId);
        if (!item) {
          toast.error('Элемент не найден');
          return;
        }
        
        let updateData = {};
        
        if (field === 'name' || field === 'cost' || field === 'description') {
          // Поля верхнего уровня
          updateData[field] = field === 'cost' ? parseFloat(editValue) : editValue;
        } else if (field.startsWith('note_')) {
          // Примечания - обрабатываем их ТОЧНО ТАК ЖЕ, как характеристики, только внутри ratings
          // Сначала сохраняем в localStorage для локальной копии
          const columnName = field.replace('note_', '');
          saveNoteToLocalStorage(itemId, columnName, editValue);
          
          // Сразу обновляем локальное состояние интерфейса
          setColumnNotes(prev => ({
            ...prev,
            [`${itemId}-${columnName}`]: editValue
          }));
          
          // Обновляем ratings ТОЧНО ТАК ЖЕ, как для обычных характеристик
          updateData = {
            ratings: { ...(item.ratings || {}) }
          };
          // Добавляем примечание с префиксом note_ в ratings
          updateData.ratings[field] = editValue;
          
          console.log('Обновляем ratings с примечанием:', updateData);
        } else {
          // Обычные характеристики
          let updatedValue = parseFloat(editValue);
          if (isNaN(updatedValue)) {
            toast.error('Введите корректное число');
            return;
          }
          
          // Обновляем ratings
          updateData = {
            ratings: { ...item.ratings }
          };
          updateData.ratings[field] = updatedValue;
        }
        
        // Отправляем запрос на обновление - ОДИНАКОВЫЙ для всех типов полей
        const response = await axios.put(
          `${BASE_URL}/api/tables/${id}/items/${itemId}`,
          updateData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        console.log('Успешный ответ сервера:', response.data);
        
        // Обновляем данные таблицы
        await fetchTable();
        
        // Показываем сообщение об успехе
        if (field.startsWith('note_')) {
          toast.success('Примечание сохранено');
        } else {
          toast.success('Значение обновлено');
        }
        
        // Сбрасываем состояние редактирования
        setEditingCell(null);
      } catch (err) {
        console.error('Ошибка обновления:', err);
        console.error('Детали ошибки:', err.response?.data);
        toast.error('Ошибка при обновлении значения');
        setEditingCell(null);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Обновляем функцию handleEditColumnNote
  const handleEditColumnNote = (itemId, columnId, columnName) => {
    console.log('handleEditColumnNote вызван с параметрами:', { itemId, columnId, columnName });
    
    if (!isOwner) return;
    
    // Используем префикс "note_" для поля
    const noteField = `note_${columnName}`;
    
    console.log('Начинаем редактирование примечания для поля:', noteField);
    
    // Установка состояния редактирования
    setEditingCell({
      itemId,
      field: noteField
    });
    
    // Получаем элемент из таблицы
    const item = tableData.items.find(i => i._id === itemId);
    
    // Получаем текущее значение примечания через getColumnNote
    const currentNote = getColumnNote(item, columnName);
    
    console.log('Текущее примечание:', currentNote);
    
    // Устанавливаем текущее значение для редактирования
    setEditValue(currentNote);
  };

  // Обработчик клика вне области редактирования для сохранения значения
  const handleClickOutside = (e) => {
    if (editingCell && !e.target.closest('.editing-cell')) {
      // Передаем объект с ключом, но без preventDefault
      handleSaveEdit({ key: 'Enter' });
    }
  };

  // Добавляем эффект для обработки клика вне поля редактирования
  useEffect(() => {
    if (editingCell) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingCell]);

  // Функция для отображения всплывающей подсказки с описанием колонки
  const handleColumnMouseEnter = (itemColumnId) => {
    setColumnTooltip(itemColumnId);
  };

  const handleColumnMouseLeave = () => {
    setColumnTooltip(null);
  };

  // Функция для редактирования описания колонки
  const handleEditColumnDescription = async (columnId, currentDescription = '') => {
    if (!isOwner) return;
    
    // Запрашиваем новое описание у пользователя через диалог
    const newDescription = prompt('Введите описание колонки:', currentDescription);
    
    // Если пользователь отменил ввод или ничего не изменил, выходим
    if (newDescription === null || newDescription === currentDescription) return;
    
    try {
      // Находим индекс колонки в массиве
      const columnIndex = tableData.columns.findIndex(col => col._id === columnId);
      if (columnIndex === -1) return;
      
      // Создаем копию массива колонок
      const updatedColumns = [...tableData.columns];
      
      // Обновляем описание в копии
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        description: newDescription
      };
      
      // Отправляем запрос на обновление таблицы
      await axios.put(`${BASE_URL}/api/tables/${id}`, {
        columns: updatedColumns
      });
      
      // Обновляем данные таблицы
      await fetchTable();
      
      toast.success('Описание колонки обновлено');
    } catch (err) {
      console.error('Error updating column description:', err);
      toast.error('Ошибка при обновлении описания колонки');
    }
  };

  // Функция для обновления примечания к элементу
  const handleUpdateNote = (itemId, newNote) => {
    if (!isOwner) return;
    
    setNotes(prev => ({
      ...prev,
      [itemId]: newNote
    }));
    
    // В реальном приложении здесь должен быть API запрос для сохранения примечания
    toast.success('Примечание сохранено');
  };

  // Функция для обработки редактирования примечания
  const handleEditNote = (itemId) => {
    if (!isOwner) return;
    
    const currentNote = notes[itemId] || '';
    const newNote = prompt('Введите примечание:', currentNote);
    
    if (newNote === null) return; // Пользователь отменил ввод
    
    handleUpdateNote(itemId, newNote);
  };

  // Функция для переключения полноэкранного режима
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Обновляем функцию для удаления таблицы
  const handleDeleteTable = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту таблицу?')) {
      console.log('Начинаем процесс удаления таблицы:', id);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('Токен авторизации не найден');
          toast.error('Пожалуйста, войдите в систему снова');
          navigate('/login');
          return;
        }
        
        console.log('Токен авторизации получен');
        
        // Настраиваем заголовки для запроса
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        // Массив различных подходов к удалению таблицы
        const deletionMethods = [
          // Метод 1: DELETE с базовым путем
          async () => {
            console.log('Попытка 1: DELETE /api/tables/:id');
            await axios.delete(`${BASE_URL}/api/tables/${id}`, { headers });
          },
          
          // Метод 2: DELETE с /remove
          async () => {
            console.log('Попытка 2: DELETE /api/tables/:id/remove');
            await axios.delete(`${BASE_URL}/api/tables/${id}/remove`, { headers });
          },
          
          // Метод 3: PUT с /destroy
          async () => {
            console.log('Попытка 3: PUT /api/tables/:id/destroy');
            await axios.put(`${BASE_URL}/api/tables/${id}/destroy`, {}, { headers });
          },
          
          // Метод 4: POST с /forceDelete
          async () => {
            console.log('Попытка 4: POST /api/tables/:id/forceDelete');
            await axios.post(`${BASE_URL}/api/tables/${id}/forceDelete`, {}, { headers });
          },
          
          // Метод 5: POST с /delete
          async () => {
            console.log('Попытка 5: POST /api/tables/:id/delete');
            await axios.post(`${BASE_URL}/api/tables/${id}/delete`, {}, { headers });
          }
        ];
        
        // Перебираем все методы до первого успешного
        let success = false;
        let lastError = null;
        
        for (const method of deletionMethods) {
          try {
            await method();
            console.log('Таблица успешно удалена!');
            success = true;
            break; // Выходим из цикла после успешного удаления
          } catch (err) {
            console.error('Ошибка при попытке удаления:', err.message);
            lastError = err;
            // Продолжаем перебор методов
          }
        }
        
        if (success) {
          toast.success('Таблица успешно удалена!');
          // Перенаправляем пользователя на страницу со списком таблиц
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          // Если все методы не сработали, выводим последнюю ошибку
          console.error('Все методы удаления не сработали. Последняя ошибка:', lastError);
          toast.error('Не удалось удалить таблицу. Попробуйте другой метод');
        }
      } catch (error) {
        console.error('Общая ошибка при удалении таблицы:', error);
        
        // Детальное логирование ошибки для отладки
        if (error.response) {
          console.error('Статус ошибки:', error.response.status);
          console.error('Данные ошибки:', error.response.data);
        }
        
        toast.error('Ошибка при удалении таблицы');
      }
    }
  };

  // Добавляем стиль для полной высоты контента
  const html = document.documentElement;
  const body = document.body;
  if (html && body) {
    html.style.height = '100%';
    html.style.margin = '0';
    html.style.padding = '0';
    body.style.height = '100%';
    body.style.margin = '0';
    body.style.padding = '0';
    body.style.overflow = 'hidden';
    
    const root = document.getElementById('root');
    if (root) {
      root.style.height = '100%';
      root.style.margin = '0';
      root.style.padding = '0';
      root.style.overflow = 'auto';
    }
  }

  // Загружаем примечания при монтировании компонента
  useEffect(() => {
    // Загружаем примечания из localStorage при первом рендере
    const localNotes = loadNotesFromLocalStorage();
    
    if (Object.keys(localNotes).length > 0) {
      console.log('Загружены примечания из localStorage:', localNotes);
      setColumnNotes(prev => ({ ...prev, ...localNotes }));
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 200px)'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 200px)',
        flexDirection: 'column'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Вернуться к списку таблиц
        </Button>
      </Box>
    );
  }

  return (
    <PageContainer>
      <TableBox>
        <PageHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              {tableData?.name || 'Загрузка...'}
            </Typography>
            {isOwner && (
              <IconButton 
                onClick={() => navigate(`/edit-table/${id}`)}
                size="small"
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
          <Box>
            {isOwner && (
              <>
                <Button 
                  variant="outlined" 
                  onClick={handleDeleteTable} 
                  startIcon={<DeleteIcon />}
                  sx={{ mr: 1 }}
                >
                  Удалить таблицу
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate(`/edit-table/${id}`)}
                  startIcon={<AddIcon />}
                  sx={{ mr: 1 }}
                >
                  Добавить характеристику
                </Button>
              </>
            )}
            <Button 
              variant="contained" 
              onClick={handleOpenModal}
              startIcon={<AddIcon />}
            >
              Добавить объект
            </Button>
          </Box>
        </PageHeader>
        
        <TableContainer sx={{ width: '100%', maxHeight: 'calc(100vh - 120px)', padding: theme.spacing(2) }}>
          <Table size="small" stickyHeader sx={{ width: '100%', tableLayout: 'auto' }}>
            <TableHead>
              <TableRow>
                <HeadCell>Название</HeadCell>
                <HeadCell align="right">Полезность</HeadCell>
                <HeadCell align="right">Стоимость</HeadCell>
                <HeadCell align="right" sx={{ 
                  backgroundColor: alpha(theme.palette.success.light, 0.1) 
                }}>
                  Полезность/Стоимость
                </HeadCell>
                
                {/* Колонки характеристик и примечаний */}
                {tableData.columns?.map((col, idx) => (
                  <React.Fragment key={idx}>
                    <HeadCell>{col.name}</HeadCell>
                    <HeadCell sx={{ 
                      fontStyle: 'italic', 
                      backgroundColor: alpha(theme.palette.warning.light, 0.05),
                      minWidth: '150px'
                    }}>
                      Примечание
                    </HeadCell>
                  </React.Fragment>
                ))}
                
                {isOwner && <HeadCell>Действия</HeadCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.items?.map((item) => (
                <TableRow key={item._id}>
                  <StyledTableCell 
                    editable={isOwner ? 'true' : 'false'}
                    onClick={() => handleCellClick(item._id, 'name', item.name)}
                  >
                    {editingCell && editingCell.itemId === item._id && editingCell.field === 'name' ? (
                      <TextField
                        className="editing-cell"
                        value={editValue}
                        onChange={handleEditChange}
                        onKeyDown={handleSaveEdit}
                        autoFocus
                        size="small"
                        fullWidth
                        variant="standard"
                      />
                    ) : (
                      item.name
                    )}
                  </StyledTableCell>
                  
                  <StyledTableCell align="right">
                    <Chip 
                      label={getUtility(item)} 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                    />
                  </StyledTableCell>
                  
                  <StyledTableCell 
                    editable={isOwner ? 'true' : 'false'}
                    onClick={() => handleCellClick(item._id, 'cost', item.cost)}
                    align="right"
                  >
                    {editingCell && editingCell.itemId === item._id && editingCell.field === 'cost' ? (
                      <TextField
                        className="editing-cell"
                        value={editValue}
                        onChange={handleEditChange}
                        onKeyDown={handleSaveEdit}
                        autoFocus
                        size="small"
                        type="number"
                        variant="standard"
                      />
                    ) : (
                      `${item.cost?.toFixed(2) || 0} ₽`
                    )}
                  </StyledTableCell>
                  
                  <StyledTableCell align="right" sx={{
                    backgroundColor: alpha(theme.palette.success.light, 0.05)
                  }}>
                    <Chip 
                      label={getUtilityToCostRatio(item)}
                      color="success" 
                      variant="outlined" 
                      size="small"
                      title="Соотношение полезности к стоимости"
                    />
                  </StyledTableCell>
                  
                  {tableData.columns && tableData.columns.map(column => (
                    <React.Fragment key={column._id || column.name}>
                      {/* Ячейка со значением характеристики */}
                      <StyledTableCell 
                        editable={isOwner ? 'true' : 'false'}
                        onClick={() => handleCellClick(item._id, column.name, item.ratings && item.ratings[column.name])}
                      >
                        {editingCell && editingCell.itemId === item._id && editingCell.field === column.name ? (
                          <TextField
                            className="editing-cell"
                            value={editValue}
                            onChange={handleEditChange}
                            onKeyDown={handleSaveEdit}
                            autoFocus
                            size="small"
                            type="number"
                            variant="standard"
                          />
                        ) : (
                          (item.ratings && item.ratings[column.name] !== undefined) ? 
                            item.ratings[column.name] : 
                            '-'
                        )}
                      </StyledTableCell>
                      
                      {/* Ячейка с примечанием к характеристике */}
                      <NotesCell 
                        editable={isOwner ? 'true' : 'false'}
                        onClick={() => handleEditColumnNote(item._id, column._id || column.name, column.name)}
                        sx={{ minWidth: '150px' }}
                      >
                        {editingCell && 
                          editingCell.itemId === item._id && 
                          editingCell.field === `note_${column.name}` ? (
                          <TextField
                            className="editing-cell"
                            value={editValue}
                            onChange={handleEditChange}
                            onKeyDown={handleSaveEdit}
                            autoFocus
                            size="small"
                            fullWidth
                            variant="standard"
                            multiline
                            placeholder="Примечание..."
                          />
                        ) : (
                          getColumnNote(item, column.name) || (isOwner ? 'Добавить...' : '-')
                        )}
                      </NotesCell>
                    </React.Fragment>
                  ))}
                  
                  {isOwner && (
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteObject(item._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TableBox>
      
      {modalOpen && (
        <Backdrop 
          open={true} 
          sx={{ zIndex: 9999 }}
          onClick={handleCloseModal}
        >
          <Box
            sx={{
              width: '90%',
              maxWidth: 800,
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 3,
              boxShadow: 24,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.background.default,
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.primary.main,
                borderRadius: '4px',
              },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              pb: 2,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" component="h2">
                Добавление нового объекта
              </Typography>
              <IconButton onClick={handleCloseModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Название объекта"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Стоимость"
                    name="cost"
                    type="number"
                    value={formData.cost || ''}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!formErrors.cost}
                    helperText={formErrors.cost || 'Укажите стоимость объекта'}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Описание"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Оценки критериев:
                  </Typography>
                </Grid>
                
                {tableData?.columns && tableData.columns.map(column => (
                  <Grid item xs={12} sm={6} md={4} key={column._id}>
                    <TextField
                      label={column.name}
                      name={column._id}
                      type="number"
                      value={formData[column._id] || ''}
                      onChange={handleInputChange}
                      fullWidth
                      inputProps={{ min: 0, max: 10, step: 0.1 }}
                      error={!!formErrors[column._id]}
                      helperText={formErrors[column._id] || 'Оценка от 0 до 10'}
                    />
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mt: 3,
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`
              }}>
                <Button onClick={handleCloseModal} sx={{ mr: 1 }}>
                  Отмена
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Добавить
                </Button>
              </Box>
            </form>
          </Box>
        </Backdrop>
      )}
    </PageContainer>
  );
};

export default TableView; 